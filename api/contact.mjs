// Proposed Vercel serverless contact endpoint. Do not merge until email-provider,
// anti-abuse, privacy, environment-variable and staging checks are approved.
const MAX_BYTES = 12_000;
const json = (status, payload) => new Response(JSON.stringify(payload), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
});
const clean = (value) => typeof value === 'string' ? value.normalize('NFC').trim() : '';
const validEmail = (value) => value.length <= 254 && /^[^\s@\r\n]+@[^\s@\r\n]+\.[^\s@\r\n]+$/.test(value);

async function readLimitedJson(request) {
  if (!request.body) throw new Error('missing_body');
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) throw new Error('too_large');
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const part of chunks) { bytes.set(part, offset); offset += part.length; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

export async function POST(request) {
  // Same-origin only. This endpoint is not a public cross-origin email relay.
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return json(403, { error: 'forbidden' });
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) {
    return json(415, { error: 'content_type' });
  }
  let input;
  try {
    input = await readLimitedJson(request);
  } catch (error) {
    return json(error?.message === 'too_large' ? 413 : 400, { error: 'invalid_request' });
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return json(400, { error: 'invalid_request' });
  }
  // Honeypot is supplementary; production needs provider-side spam/rate limits.
  if (clean(input.website)) return json(200, { ok: true, accepted: false });

  const name = clean(input.name);
  const company = clean(input.company);
  const email = clean(input.email);
  const message = clean(input.message);
  const id = clean(input.submission_id);
  const locale = input.locale === 'el' ? 'el' : 'en';

  if (!name || name.length > 100 || /[\r\n\x00-\x1f]/.test(name) ||
      company.length > 120 || /[\r\n\x00-\x1f]/.test(company) ||
      !validEmail(email) || message.length < 10 || message.length > 3000 ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return json(400, { error: 'invalid_fields' });
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !from || !to) return json(503, { error: 'not_configured' });

  // No visitor data is sent to analytics; the email stays server-side.
  const body = [
    'New The Growth Cubes website inquiry',
    'Language: ' + locale,
    'Name: ' + name,
    'Company: ' + (company || '(not supplied)'),
    'Email: ' + email,
    '',
    'Message:',
    message
  ].join('\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
        'Idempotency-Key': 'contact/' + id
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: [email],
        subject: locale === 'el' ? 'Νέο αίτημα επικοινωνίας — The Growth Cubes' : 'New inquiry — The Growth Cubes',
        text: body
      }),
      signal: AbortSignal.timeout(8000)
    });
    // The provider accepted the agency inquiry for delivery.
    // A visitor acknowledgment is independent and must never invalidate this success.
    if (!response.ok) return json(502, { error: 'email_provider_error' });

    let acknowledgmentAccepted = false;
    if (process.env.CONTACT_AUTO_ACK_ENABLED === 'true') {
      const confirmation = locale === 'el'
        ? [
            'Γεια σας,',
            '',
            'Σας ευχαριστούμε που επικοινωνήσατε με το The Growth Cubes.',
            'Λάβαμε το μήνυμά σας και θα εξετάσουμε το αίτημά σας.',
            'Θα επικοινωνήσουμε μαζί σας μέσω email.',
            '',
            'Με εκτίμηση,',
            'The Growth Cubes',
            '',
            'Αυτό είναι ένα αυτοματοποιημένο μήνυμα επιβεβαίωσης παραλαβής.',
            'Δεν αποτελεί εγγραφή σε ενημερωτικό δελτίο (newsletter).',
            'Εάν δεν υποβάλατε εσείς το αίτημα, μπορείτε να αγνοήσετε αυτό το email.'
          ].join('\n')
        : [
            'Hello,',
            '',
            'Thank you for contacting The Growth Cubes.',
            'We received your message and will review your inquiry.',
            'We will get back to you by email.',
            '',
            'Best regards,',
            'The Growth Cubes',
            '',
            'This is an automated acknowledgment of your inquiry.',
            'It does not subscribe you to our newsletter.',
            'If you did not submit this request, you can ignore this email.'
          ].join('\n');

      try {
        // Separate idempotency keys for the agency inquiry and visitor acknowledgment.
        // Keep this best-effort call shorter than the browser's total request timeout.
        const ack = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + key,
            'Content-Type': 'application/json',
            'Idempotency-Key': 'contact-ack/' + id
          },
          body: JSON.stringify({
            from,
            to: [email],
            reply_to: [to],
            subject: locale === 'el'
              ? 'Λάβαμε το μήνυμά σας — The Growth Cubes'
              : 'We received your message — The Growth Cubes',
            text: confirmation
          }),
          signal: AbortSignal.timeout(2500)
        });
        acknowledgmentAccepted = ack.ok;
      } catch {
        // The agency inquiry is already accepted. Do not falsely report failure.
      }
    }
    return json(200, { ok: true, accepted: true, acknowledgment_accepted: acknowledgmentAccepted });
  } catch {
    return json(502, { error: 'email_provider_unavailable' });
  }
}

export function GET() {
  return json(405, { error: 'method_not_allowed' });
}
