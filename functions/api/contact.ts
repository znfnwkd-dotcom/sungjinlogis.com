export interface Env {
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  CONTACT_TO: string;
  TURNSTILE_SECRET_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const data = await context.request.json().catch(() => null);
    if (!data) return new Response('Bad request', { status: 400 });

    // Basic honeypot
    if (typeof data?.hp === 'string' && data.hp.trim() !== '') {
      return new Response('OK', { status: 200 });
    }

    const email = String(data?.email ?? '').trim();
    const subjectRaw = String(data?.subject ?? '').trim();
    const message = String(data?.message ?? '').trim();
    const turnstileToken = String(data?.turnstileToken ?? '').trim();

    // Language
    const rawLang = String(data?.lang ?? '').trim().toLowerCase();
    const acceptLang = (context.request.headers.get('accept-language') || '').toLowerCase();
    const isKR = rawLang.startsWith('ko') || (!rawLang && acceptLang.includes('ko'));

    // Validate required
    if (!email || !message) return new Response('Missing required fields', { status: 400 });
    if (!turnstileToken) return new Response('Turnstile token missing', { status: 400 });

    // Simple length limits
    if (email.length > 254 || subjectRaw.length > 200 || message.length > 5000) {
      return new Response('Input too long', { status: 400 });
    }

    // Env
    const resendKey = context.env.RESEND_API_KEY;
    const to = context.env.CONTACT_TO;
    const from = context.env.FROM_EMAIL;
    const turnstileSecret = context.env.TURNSTILE_SECRET_KEY;

    if (!resendKey || !to || !from) return new Response('Server not configured', { status: 500 });
    if (!turnstileSecret) return new Response('Server not configured (Turnstile)', { status: 500 });

    // ✅ Verify Turnstile
    const ip = context.request.headers.get('CF-Connecting-IP') || undefined;

const tv = await verifyTurnstile(turnstileSecret, turnstileToken, ip);

if (!tv?.success) {
  console.log('Turnstile failed:', tv);
  return new Response(
    `Turnstile verification failed: ${JSON.stringify(tv?.['error-codes'] || tv)}`,
    { status: 403 }
  );
}

    // Subject style
    const cleanedSubject = subjectRaw || (isKR ? '제목 없음' : 'No subject');
    const mailSubject = `[성진로지스 문의] ${cleanedSubject}`;

    // KST time
    const kst = new Date(Date.now() + 9 * 60 * 60 * 1000)
      .toISOString()
      .replace('T', ' ')
      .slice(0, 19) + ' KST';

    // Body style
    const internalText =
      `성진로지스 웹사이트 문의가 접수되었습니다.\n` +
      `--------------------------------------------------\n` +
      `접수일시: ${kst}\n` +
      `언어: ${isKR ? 'KR' : 'EN'}\n` +
      `보낸사람: ${email}\n` +
      `제목: ${cleanedSubject}\n` +
      `--------------------------------------------------\n` +
      `내용:\n${message}\n` +
      `--------------------------------------------------\n` +
      `※ 본 메일은 홈페이지 Contact 폼에서 자동 발송되었습니다.\n`;

    await sendResend(resendKey, {
      from,
      to,
      subject: mailSubject,
      text: internalText,
      replyTo: email,
    });

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response('Server error', { status: 500 });
  }
};

async function verifyTurnstile(secret: string, token: string, remoteip?: string) {
  const form = new URLSearchParams();
  form.set('secret', secret);
  form.set('response', token);
  // remoteip는 문제를 만들 수도 있어서, 일단 빼고 확인하는 것도 방법입니다.
  // if (remoteip) form.set('remoteip', remoteip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });

  const data = await res.json().catch(() => null);
  return data; // ✅ success / error-codes / hostname 등이 들어있음
}

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
