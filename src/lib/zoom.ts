function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getZoomAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const accountId = requireEnv('ZOOM_ACCOUNT_ID');
  const clientId = requireEnv('ZOOM_CLIENT_ID');
  const clientSecret = requireEnv('ZOOM_CLIENT_SECRET');

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    // 401/400 from token endpoint usually means wrong account_id, client_id, or secret.
    throw new Error(`Zoom OAuth failed [HTTP ${res.status}]: ${body || '(empty body)'}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + Math.max(0, (data.expires_in - 60)) * 1000,
  };
  return data.access_token;
}

export type ZoomRegistrantInput = {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  city?: string;
};

/**
 * Some Zoom accounts strictly validate the phone field and reject raw 10-digit
 * Indian numbers. Normalize to E.164 (+91...) when the input looks Indian.
 */
function normalizePhone(raw?: string): string | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  if (raw.trim().startsWith('+')) return raw.trim();
  return `+${digits}`;
}

export type ZoomRegistrationResult =
  | { ok: true; joinUrl: string; registrantId: string }
  | { ok: false; error: string };

function describeZoomError(status: number, body: any): string {
  // Zoom error shape: { code: 300, message: '...', errors?: [{ field, message }] }
  const parts: string[] = [`HTTP ${status}`];
  if (body?.code != null) parts.push(`code=${body.code}`);
  if (body?.message) parts.push(body.message);
  if (Array.isArray(body?.errors) && body.errors.length) {
    const fieldErrors = body.errors
      .map((e: any) => `${e.field ?? '?'}: ${e.message ?? JSON.stringify(e)}`)
      .join(' | ');
    parts.push(`fields=[${fieldErrors}]`);
  }
  return parts.join(' ');
}

export async function registerWebinarParticipant(
  input: ZoomRegistrantInput
): Promise<ZoomRegistrationResult> {
  try {
    const webinarId = requireEnv('ZOOM_WEBINAR_ID');
    if (!/^\d{9,12}$/.test(webinarId)) {
      return { ok: false, error: `ZOOM_WEBINAR_ID looks invalid (expected 9-12 digits): ${webinarId}` };
    }

    // Zoom rejects empty first_name with a confusing error.
    const firstName = (input.firstName || '').trim();
    if (!firstName) {
      return { ok: false, error: 'first_name is empty — cannot register with Zoom' };
    }

    const token = await getZoomAccessToken();

    const payload: Record<string, string> = {
      email: input.email,
      first_name: firstName,
      last_name: (input.lastName || '').trim(),
    };
    const normalizedPhone = normalizePhone(input.phone);
    if (normalizedPhone) payload.phone = normalizedPhone;
    if (input.city) payload.city = input.city;

    const res = await fetch(
      `https://api.zoom.us/v2/webinars/${webinarId}/registrants`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      // If the token was rejected, clear cache so the next attempt re-auths.
      if (res.status === 401) tokenCache = null;
      return { ok: false, error: `Zoom registrant create failed: ${describeZoomError(res.status, body)}` };
    }

    if (!body?.join_url) {
      return {
        ok: false,
        error: 'Zoom returned 200 but no join_url. Webinar Approval is likely set to "Manually Approve" — change to "Automatically Approve".',
      };
    }

    return {
      ok: true,
      joinUrl: body.join_url,
      registrantId: String(body.registrant_id ?? body.id ?? ''),
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
