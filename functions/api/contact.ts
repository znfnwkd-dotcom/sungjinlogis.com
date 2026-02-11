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

    const rawLang = String(data?.lang ?? '').trim().toLowerCase();
    const acceptLang = (context.request.headers.get('accept-language') || '').toLowerCase();
    const isKR = rawLang.startsWith('ko') || (!rawLang && acceptLang.includes('ko'));

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
      `Language: ${isKR ? 'Korean' : 'English'}\n` +
      `From: ${email}\n` +
      `Subject: ${subject}\n` +
      `Received: ${now}\n\n` +
      `Message:\n${message}\n`;

    await sendResend(resendKey, {
  from,
  to,
  subject: `[Website] ${subject}`,
  text: internalText,
  replyTo: email, // ✅ reply_to -> replyTo 로 변경
});


    // Acknowledgement to sender
    const ackSubject = isKR ? 'SUNGJINLOGIS — 문의 접수 완료' : 'SUNGJINLOGIS — We received your message';
    const ackText = isKR
      ? `문의가 접수되었습니다.\n\n` +
        `제목: ${subject}\n` +
        `회신은 영업일 기준 빠르게 드리겠습니다.\n\n` +
        `감사합니다.\nSUNGJINLOGIS\n`
      : `We have received your message.\n\n` +
        `Subject: ${subject}\n` +
        `We will get back to you as soon as possible on business days.\n\n` +
        `Thank you.\nSUNGJINLOGIS\n`;

    //await sendResend(resendKey, {
      //from,
      //to: email,
      //subject: ackSubject,
      //text: ackText,
    //});

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
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error: ${res.status} ${text}`);
  }
}
