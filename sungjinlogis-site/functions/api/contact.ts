export const onRequestPost: PagesFunction = async (context) => {
  try {
    const data = await context.request.json();

    // Basic honeypot
    if (typeof data?.hp === 'string' && data.hp.trim() !== '') {
      return new Response('OK', { status: 200 });
    }

    const email = String(data?.email ?? '').trim();
    const subject = String(data?.subject ?? '').trim() || 'SUNGJINLOGIS Website Contact';
    const message = String(data?.message ?? '').trim();

    if (!email || !message) {
      return new Response('Missing required fields', { status: 400 });
    }

    const resendKey = context.env.RESEND_API_KEY;
    const to = context.env.CONTACT_TO;
    const from = context.env.FROM_EMAIL;

    if (!resendKey || !to || !from) {
      return new Response('Server not configured', { status: 500 });
    }

    const now = new Date().toISOString();

    const internalText =
      `Website contact received\n\n` +
      `From: ${email}\n` +
      `Subject: ${subject}\n` +
      `Received: ${now}\n\n` +
      `Message:\n${message}\n`;

    await sendResend(resendKey, {
      from,
      to,
      subject: `[Website] ${subject}`,
      text: internalText,
      reply_to: email
    });

    // Optional: send an acknowledgement to the sender
    await sendResend(resendKey, {
      from,
      to: email,
      subject: 'SUNGJINLOGIS — 문의 접수 완료',
      text:
        `문의가 접수되었습니다.\n\n` +
        `내용: ${subject}\n` +
        `회신은 영업일 기준 빠르게 드리겠습니다.\n\n` +
        `감사합니다.\nSUNGJINLOGIS\n`
    });

    return new Response('OK', { status: 200 });
  } catch (err) {
    return new Response('Bad request', { status: 400 });
  }
};

async function sendResend(apiKey: string, payload: Record<string, any>) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error: ${res.status} ${text}`);
  }
}
