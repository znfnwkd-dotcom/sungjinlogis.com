# 저장소 분석 메모

## 1) 사이트 성격
- 성진로지스(SUNGJINLOGIS) 기업 소개/영업용 웹사이트
- 핵심 콘텐츠: 회사소개, 공정/역량, 품질/인증, 설비, 적용산업, 자료실, 문의
- 정적 페이지 중심 + Cloudflare Pages Functions 기반 폼 처리 API(문의/브로셔 요청)

## 2) 프레임워크/빌드툴 근거
- Astro 사용: `astro` 패키지 및 `astro.config.mjs` 존재
- TailwindCSS 사용: `@astrojs/tailwind`, `tailwind.config.cjs`, `postcss.config.cjs`
- 빌드/개발 명령: `astro dev`, `astro build`, `astro preview`
- 배포 대상: README에 Cloudflare Pages + Pages Functions 명시

## 3) 페이지 구조
- 언어 선택 루트: `/`
- 한국어: `/kr/*`
- 영어: `/en/*`
- 상세 라우트: capabilities 하위 공정 상세(산성동, 니켈, 3가크롬 등), company, quality, facilities, industries, downloads, contact
- SEO/크롤링: `robots.txt`와 `sitemap.xml`을 Astro API 라우트로 생성

## 4) 실행/빌드/배포
- 로컬 개발: `npm run dev`
- 빌드: `npm run build`
- 프리뷰: `npm run preview`
- 배포: Cloudflare Pages에서 빌드 커맨드 `npm run build`, 산출물 `dist`
- 필요 환경변수: `RESEND_API_KEY`, `FROM_EMAIL`, `CONTACT_TO`, `BROCHURE_URL`, 문의 API에서 `TURNSTILE_SECRET_KEY`도 필요

## 5) 위험요소 점검
- 비밀키 하드코딩은 확인되지 않음(환경변수 참조 방식)
- 문의 API 디버그 응답에서 Turnstile 에러코드를 그대로 반환(운영 시 정보 노출 최소화 필요)
- `RATE_LIMIT_KV`가 없으면 IP 기반 속도 제한이 비활성화될 수 있음(설정 누락 시 스팸 방어 약화)
- 루트에 `sungjinlogis-site/`가 중복 존재해 실제 배포 대상 혼동 가능
