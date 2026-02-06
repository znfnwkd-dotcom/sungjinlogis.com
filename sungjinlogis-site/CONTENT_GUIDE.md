# CONTENT GUIDE (교체/수정 가이드)

이 프로젝트는 **사진/로고 없이도** 바로 배포할 수 있게 임시 이미지로 구성되어 있습니다.
나중에 자료가 준비되면 아래 순서대로 교체하면 됩니다.

## 1) 로고 교체
1. 로고 파일을 `public/images/logo.svg` (또는 `.png`)로 저장
2. `src/components/Header.astro`에서 아래 블록을 찾습니다.

```html
<div class="h-9 w-9 rounded-xl border border-stroke bg-surface shadow-soft"></div>
```

3. 다음처럼 교체합니다.

```html
<img src="/images/logo.svg" alt="SUNGJINLOGIS" class="h-9 w-9 rounded-xl" loading="lazy" />
```

## 2) 대표(히어로) 이미지 교체 (메탈 매크로)
- 현재: `public/images/metal-hero.svg` (임시)
- 교체 방법:
  1) 새 이미지를 `public/images/metal-hero.jpg`로 넣기
  2) `src/pages/kr/index.astro`에서 아래를 찾고:

```html
<img src="/images/metal-hero.svg" ... />
```

  3) 다음으로 변경:

```html
<img src="/images/metal-hero.jpg" ... />
```

## 3) 공장/라인/제품 사진 넣기
- 추천 폴더: `public/images/gallery/`
- 예: `public/images/gallery/line1.jpg`, `product1.jpg` 등
- 넣은 뒤, 각 페이지(예: `src/pages/kr/facilities.astro`)에서 `<img>`를 추가하면 됩니다.

## 4) 인증서/시험성적서/장비 사진
- 추천 위치: `/kr/quality/` 페이지
- 추천 폴더: `public/images/cert/` 및 `public/images/test/`
- 예: `public/images/cert/iso9001.jpg`

## 5) 회사소개서(PDF) 다운로드 링크 설정
이 사이트는 **이메일 입력 → 링크 발송** 방식입니다.

1) PDF 파일을 온라인에 올립니다.
- 추천: Cloudflare R2, Google Drive(공유 링크), 사내 서버 등

2) Cloudflare Pages 환경변수에 링크를 넣습니다.
- `BROCHURE_URL` = (PDF 링크)

## 6) 이메일 발송(Resend) 설정
Cloudflare Pages Functions가 Resend API로 메일을 보냅니다.

필수 환경변수:
- `RESEND_API_KEY`
- `FROM_EMAIL` (예: `SUNGJINLOGIS <noreply@sungjinlogis.com>`)
- `CONTACT_TO` (예: `chiwon1@kakao.net`)
- `BROCHURE_URL`

> `FROM_EMAIL`은 Resend에서 도메인 인증을 완료한 뒤 도메인 이메일로 바꾸는 것을 권장합니다.

## 7) 문구(텍스트) 수정 위치
- 한글 홈: `src/pages/kr/index.astro`
- 회사소개: `src/pages/kr/company.astro`
- 공정 목록: `src/pages/kr/capabilities/index.astro`
- 품질/인증: `src/pages/kr/quality.astro`
- 문의/다운로드: `src/pages/kr/contact.astro`, `src/pages/kr/downloads.astro`
