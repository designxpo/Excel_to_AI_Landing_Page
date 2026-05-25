// Manual attendance sync — pulls participants from Zoom Reports API, marks
// matching registration rows as `attended`, fires a Meta CAPI WebinarAttended
// event (idempotent — only for rows that haven't fired yet), and flips a flag
// in LeadSquared so sales can prioritise actual attendees.
//
// Triggered by the admin "Sync Attendance" button. Designed to be safely
// re-runnable: every external side effect is gated by a flag on the row.
//
// IMPORTANT — required Zoom OAuth scope:
//   report:read:admin (or report_participants:read:admin)
// If your S2S app doesn't have it, the Reports API returns "4711 missing
// scopes". Add it in Zoom Marketplace → Scopes, then re-publish.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchWebinarAttendees } from '@/lib/zoom';
import { sendMetaCapiEvent } from '@/lib/meta';
import {
  getVerifiedRegistrationsForAttendanceSync,
  updateRegistrationAttendance,
  recordAttendanceSyncRun,
  getLatestAttendanceSyncRun,
  getWebinarConfig,
} from '@/lib/db';
import { verifyAdminSession } from '@/lib/auth';
import { assertSameOrigin } from '@/lib/security';

const META_EVENT_NAME = process.env.META_ATTENDED_EVENT_NAME || 'WebinarAttended';
const LSQ_ATTENDED_FIELD = process.env.LSQ_ATTENDED_FIELD || 'mx_Attended_Webinar';

async function lsqMarkAttended(phone: string, durationMin: number): Promise<boolean> {
  const access = process.env.LSQ_ACCESS;
  const secret = process.env.LSQ_SECRET;
  if (!access || !secret) return false;
  try {
    const searchRes = await fetch(
      `https://api-in21.leadsquared.com/v2/LeadManagement.svc/RetrieveLeadByPhoneNumber?accessKey=${access}&secretKey=${secret}&phone=${encodeURIComponent(phone)}`,
    );
    const searchData = await searchRes.json();
    if (!searchRes.ok || !searchData?.length) return false;
    const prospectId = searchData[0].ProspectID;
    const updateRes = await fetch(
      `https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Update?accessKey=${access}&secretKey=${secret}&leadId=${prospectId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { Attribute: LSQ_ATTENDED_FIELD, Value: 'Yes' },
          { Attribute: 'mx_Attendance_Duration_Min', Value: String(durationMin) },
        ]),
      },
    );
    return updateRes.ok;
  } catch (err) {
    console.error('[Attendance LSQ] error:', err);
    return false;
  }
}

export async function POST(request: Request) {
  const origin = assertSameOrigin(request);
  if (!origin.ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const token = (await cookies()).get('admin_session')?.value;
  const session = await verifyAdminSession(token);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const startedAt = new Date().toISOString();
  let attendeesTotal = 0;
  let newlyMarked = 0;
  let metaFired = 0;
  let lsqUpdated = 0;
  const errors: string[] = [];

  try {
    // Resolve the webinar ID from admin DB (falls back to env in fetchWebinarAttendees).
    const config = await getWebinarConfig().catch(() => null);
    const webinarOverride = config?.zoomWebinarId?.trim() || null;

    // 1. Fetch attendees from Zoom.
    const result = await fetchWebinarAttendees(webinarOverride);
    if (!result.ok) {
      await recordAttendanceSyncRun({
        ranAt: startedAt,
        ranBy: session.sub,
        webinarId: webinarOverride,
        attendeesTotal: 0,
        newlyMarked: 0,
        metaFired: 0,
        lsqUpdated: 0,
        errorSummary: result.error,
      });
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }
    attendeesTotal = result.attendees.length;
    const attendeesByEmail = new Map(result.attendees.map((a) => [a.email, a]));

    // 2. Pull our verified registrations and decide which ones to mark.
    const registrations = await getVerifiedRegistrationsForAttendanceSync();

    // 3. Process each registration. We update DB sequentially to keep error
    // handling simple — the typical webinar has ≤500 attendees, so this is
    // fine. Could parallelize if needed later.
    for (const reg of registrations) {
      const matched = attendeesByEmail.get(reg.email.toLowerCase());

      if (!matched) {
        // No-show. Mark attended=false if we haven't already.
        if (reg.attended !== false) {
          try {
            await updateRegistrationAttendance({ id: reg.id, attended: false });
          } catch (err) {
            errors.push(`[no-show update ${reg.email}] ${err instanceof Error ? err.message : err}`);
          }
        }
        continue;
      }

      // Attended. Flip the row.
      const wasNewlyMarked = reg.attended !== true;
      try {
        await updateRegistrationAttendance({
          id: reg.id,
          attended: true,
          attendedAt: matched.joinTime,
          attendanceDurationMin: matched.durationMin,
        });
        if (wasNewlyMarked) newlyMarked++;
      } catch (err) {
        errors.push(`[attended update ${reg.email}] ${err instanceof Error ? err.message : err}`);
        continue;
      }

      // 3a. Fire Meta CAPI — but only once per registration (idempotent).
      if (!reg.metaAttendedEventFired) {
        const nameParts = (reg.fullName || '').split(' ').filter(Boolean);
        // Deterministic event_id so re-running this sync won't double-count
        // even if the DB flag failed to write last time.
        const eventId = `attended_${reg.id}`;
        const capiRes = await sendMetaCapiEvent({
          eventName: META_EVENT_NAME,
          eventId,
          eventTime: Math.floor(new Date(matched.joinTime).getTime() / 1000),
          actionSource: 'system_generated',
          userData: {
            email: reg.email,
            phone: reg.phone,
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' '),
            city: reg.city,
            country: 'in',
            externalId: reg.id,
          },
          customData: {
            content_name: 'ExcelToAI_Masterclass',
            duration_min: matched.durationMin,
            webinar_id: result.webinarId,
          },
        });
        if (capiRes.ok) {
          metaFired++;
          try {
            await updateRegistrationAttendance({ id: reg.id, attended: true, metaAttendedEventFired: true });
          } catch {
            // Best-effort. If this update fails, the next sync will retry the
            // CAPI call — Meta dedups on `event_id` so it's safe.
          }
        } else {
          errors.push(`[meta capi ${reg.email}] ${capiRes.error}`);
        }
      }

      // 3b. Mark LSQ. Not idempotent on our side, but LSQ is — overwriting
      // the same attribute is harmless.
      const lsqOk = await lsqMarkAttended(reg.phone, matched.durationMin);
      if (lsqOk) lsqUpdated++;
    }

    // 4. Audit log.
    await recordAttendanceSyncRun({
      ranAt: startedAt,
      ranBy: session.sub,
      webinarId: result.webinarId,
      attendeesTotal,
      newlyMarked,
      metaFired,
      lsqUpdated,
      errorSummary: errors.length ? errors.slice(0, 10).join(' | ') : null,
    });

    return NextResponse.json({
      success: true,
      attendeesTotal,
      newlyMarked,
      metaFired,
      lsqUpdated,
      errors: errors.slice(0, 10), // truncate response — first 10 is enough to diagnose
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[sync-attendance] fatal:', err);
    await recordAttendanceSyncRun({
      ranAt: startedAt,
      ranBy: session.sub,
      webinarId: null,
      attendeesTotal,
      newlyMarked,
      metaFired,
      lsqUpdated,
      errorSummary: msg,
    });
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// Convenience for the admin UI: GET returns the latest sync summary.
export async function GET() {
  const token = (await cookies()).get('admin_session')?.value;
  const session = await verifyAdminSession(token);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });
  const latest = await getLatestAttendanceSyncRun();
  return NextResponse.json({ latest });
}
