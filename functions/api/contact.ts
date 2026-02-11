export const onRequestPost: PagesFunction = async (context) => {
  try {
    let data: any;
    try {
      data = await context.request.json();
    } catch {
      return new Response('Bad request', { status: 400 });
    }

    // Honeypot
    if (typeof data?.hp === 'string' && data.hp.trim() !== '') {
      return new Response('OK', { status: 200 });
    }

    const email = String(data?.email ?? '').trim();
    const subjectRaw = String(data?.subject ?? '').trim();
    const message = String(data?.message ?? '').trim();

    const rawLang = String(data?.lang ?? '').trim().toLowerCase();
    const acceptLang = (context.request.headers.get('accept-language') || '').toLowerCase();
    const isKR = rawLang.startsWith('ko') || (!rawLang && acceptLang.includes('ko'));

    if (!email || !message) {
      return new Response('Missing required fields', { status: 400 });
    }

    // ✅ Turnstile token (robust)
    const token =
      (typeof data?.turnstileToken === 'string' && data.turnstileToken.trim()) ||
      (typeof data?.['cf-turnstile-response'] === 'string' && data['cf-turnstile-response'].trim()) ||
      (typeof data?.cfTurnstileResponse === 'string' && data.cfTurnstileResponse.trim()) ||
      '';

    if (!token) {
      return new Response('Turnstile token missing', { status: 400 });
    }

    const turnstileSecret = context.env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      return new Response('Server not configured (TURNSTILE_SECRET_KEY)', { status: 500 });
    }

    // ✅ Verify Turnstile (server-side)
    const body = new URLSearchParams();
    body.set('secret', turnstileSecret);
    body.set('response', token);

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const verifyJson = await verifyRes.json<any>();

    if (!verifyJson?.success) {
      console.log('Turnstile failed:', {
        codes: verifyJson?.['error-codes'],
        hostname: verifyJson?.hostname,
      });

      // 운영에서는 코드 노출 안 하는 게 좋습니다(지금은 디버깅용)
      return new Response(
        `Turnstile verification failed: ${JSON.stringify(verifyJson?.['error-codes'] || [])}`,
        { status: 400 }
      );
    }

    // ✅ Rate limit (Turnstile 통과한 요청만 카운트)
    const kv = (context.env as any).RATE_LIMIT_KV as KVNamespace | undefined;
    const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';

    if (kv && ip !== 'unknown') {
      const windowSec = 60; // 1분
      const limit = 3;      // 1분에 3회
      const bucket = Math.floor(Date.now() / (windowSec * 1000));
      const key = `rl:contact:${ip}:${bucket}`;

      const cur = Number((await kv.get(key)) || '0');
      if (cur >= limit) {
        return new Response('Too many requests. Please try again later.', { status: 429 });
      }
      await kv.put(key, String(cur + 1), { expirationTtl: windowSec + 5 });
    }

    // ✅ Resend settings
    const resendKey = context.env.RESEND_API_KEY;
    const to = context.env.CONTACT_TO;
    const from = context.env.FROM_EMAIL;

    if (!resendKey || !to || !from) {
      return new Response(
        'Server not configured (RESEND_API_KEY/CONTACT_TO/FROM_EMAIL)',
        { status: 500 }
      );
    }

    // ✅ “회사 스타일” 제목/본문
    const subject = subjectRaw || (isKR ? '홈페이지 문의' : 'Website Inquiry');

    const mailSubject = isKR
      ? `[성진로지스 문의] ${subject}`
      : `[SUNGJINLOGIS Inquiry] ${subject}`;

    const nowISO = new Date().toISOString();
    const pageLang = isKR ? 'Korean' : 'English';
    const ua = context.request.headers.get('user-agent') || '';

    const internalText = isKR
      ? [
          '성진로지스 홈페이지 문의가 접수되었습니다.',
          '',
          `접수시각(UTC): ${nowISO}`,
          `언어: ${pageLang}`,
          `보낸사람: ${email}`,
          `제목: ${subject}`,
          '',
          '문의 내용:',
          message,
          '',
          '---',
          `IP: ${ip}`,
          `UA: ${ua}`,
        ].join('\n')
      : [
          'A new inquiry has been received from the SUNGJINLOGIS website.',
          '',
          `Received (UTC): ${nowISO}`,
          `Language: ${pageLang}`,
          `From: ${email}`,
          `Subject: ${subject}`,
          '',
          'Message:',
          message,
          '',
          '---',
          `IP: ${ip}`,
          `UA: ${ua}`,
        ].join('\n');

    await sendResend(resendKey, {
      from,
      to,
      subject: mailSubject,
      text: internalText,
      reply_to: email, // ✅ HTTP API: reply_to
    });

    return new Response('OK', { status: 200 });
  } catch (err) {
    console.log('contact.ts error:', err);
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
