// Centralized WhatsApp OTP sender.
// IMPORTANT: A 200 OK from the Graph API only means Meta accepted the message
// into its queue — it does NOT guarantee delivery to the user's phone. Delivery
// is reported via the messages.statuses webhook, which we don't subscribe to.
// The returned `status` here therefore reflects send-API outcome, not delivery.

// Graph API version. v17 was EOL'd in mid-2025; v22 is the current LTS.
// Centralize so we can bump everywhere with one edit.
const GRAPH_API_VERSION = 'v22.0';

export type WhatsAppSendResult = {
  status: 'sent' | 'api_failed' | 'skipped';
  error: string | null;
};

export async function sendWhatsAppOtp(
  phone: string,
  otp: string,
  templateName: string,
): Promise<WhatsAppSendResult> {
  const waAccessToken = process.env.META_WA_ACCESS_TOKEN;
  const waPhoneId = process.env.META_WA_PHONE_NUMBER_ID;
  if (!waAccessToken || !waPhoneId) {
    return { status: 'skipped', error: 'Meta WA env vars not configured' };
  }

  try {
    const waRes = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${waPhoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${waAccessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: `91${phone}`,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en_US' },
          components: [{ type: 'body', parameters: [{ type: 'text', text: otp }] }],
        },
      }),
    });

    if (waRes.ok) {
      return { status: 'sent', error: null };
    }

    // Capture Meta's specific error message + code for telemetry.
    let detail = `HTTP ${waRes.status}`;
    try {
      const body = await waRes.json();
      const err = body?.error;
      if (err) {
        const code = err.code ?? '?';
        const msg = err.message ?? 'unknown';
        const subCode = err.error_subcode ? ` (subcode ${err.error_subcode})` : '';
        detail = `code=${code}${subCode}: ${msg}`;
      }
    } catch {
      // Body wasn't JSON — keep the HTTP status.
    }
    console.error('[WhatsApp] Send failed:', detail);
    return { status: 'api_failed', error: detail };
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown network error';
    console.error('[WhatsApp] Network error:', err);
    return { status: 'api_failed', error: detail };
  }
}
