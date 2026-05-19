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
    throw new Error(`Zoom OAuth failed: ${res.status} ${body}`);
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

export type ZoomRegistrationResult =
  | { ok: true; joinUrl: string; registrantId: string }
  | { ok: false; error: string };

export async function registerWebinarParticipant(
  input: ZoomRegistrantInput
): Promise<ZoomRegistrationResult> {
  try {
    const webinarId = requireEnv('ZOOM_WEBINAR_ID');
    if (!/^\d{9,12}$/.test(webinarId)) {
      return { ok: false, error: `ZOOM_WEBINAR_ID looks invalid (expected 9-12 digits): ${webinarId}` };
    }

    const token = await getZoomAccessToken();

    const payload: Record<string, string> = {
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName || '',
    };
    if (input.phone) payload.phone = input.phone;
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
      const message = body?.message || `HTTP ${res.status}`;
      return { ok: false, error: `Zoom registrant create failed: ${message}` };
    }

    if (!body?.join_url) {
      return {
        ok: false,
        error: 'Zoom did not return a join_url. Check webinar "Approval" is set to "Automatically Approve".',
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
