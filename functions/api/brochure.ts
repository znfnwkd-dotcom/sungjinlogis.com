export const onRequestPost: PagesFunction = async (context) => {
  try {
    const data = await context.request.json();

    // Honeypot
    if (typeof data?.hp === 'string' && data.hp.trim() !== '') {
      return new Response('OK', { status: 200 });
    }

    const email = String(data?.email ?? '').trim();
    const company = String(data?.company ?? '').trim();
    const name = String(data?.name ?? '').trim();

    const rawLang = String(data?.lang ?? '').trim().toLowerCase();
    const acceptLang = (context.request.headers.get('accept-language') || '').toLowerCase();
    const isKR = rawLang.startsWith('ko') || (!rawLang && acceptLang.includes('ko'));

    if (!email) {
      return new Response('Missing email', { status: 400 });
    }

    const resendKey = context.env.RESEND_API_KEY;
    const toInternal = context.env.CONTACT_TO;
    const from = context.env.FROM_EMAIL;
    const brochureUrl = context.env.BROCHURE_URL;

    if (!resendKey || !toInternal || !from || !brochureUrl) {
      return new Response('Server not configured', { status: 500 });
    }

    const now = new Date().toISOString();
    const who = [name, company].filter(Boolean).join(' / ');

    const requesterSubject = isKR
      ? 'SUNGJINLOGIS — 회사소개서 다운로드 링크'
      : 'SUNGJINLOGIS — Company Profile Download Link';

    const requesterText = isKR
      ? `요청해주셔서 감사합니다.

회사소개서(PDF) 다운로드 링크:
${brochureUrl}

추가 자료가 필요하시거나 기술/품질 관련 문의가 있으시면 언제든지 회신해주세요.

SUNGJINLOGIS
www.sungjinlogis.com
`
      : `Thank you for your request.

Company profile (PDF) download link:
${brochureUrl}

If you need additional materials or have technical/quality questions, feel free to reply to this email.

SUNGJINLOGIS
www.sungjinlogis.com
`;

    // Email to requester
    await sendResend(resendKey, {
      from,
      to: email,
      subject: requesterSubject,
      text: requesterText,
    });

    // Notification to internal mailbox
    await sendResend(resendKey, {
      from,
      to: toInternal,
      subject: `[Website] Brochure download request (${isKR ? 'KR' : 'EN'})`,
      text:
        `Brochure request received\n\n` +
        `Language: ${isKR ? 'Korean' : 'English'}\n` +
        `Email: ${email}\n` +
        `Name/Company: ${who || '-'}\n` +
        `Received: ${now}\n`,
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
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error: ${res.status} ${text}`);
  }
}
