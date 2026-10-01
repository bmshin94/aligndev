# AlignDev 전수조사 & 수익화 전략 정리 (한국어)

> **저장소**: <https://github.com/bmshin94/aligndev>
> **분석 브랜치**: `claude/eloquent-pascal-76wgto`
> **작성일**: 2026-10-01
> **문서 성격**: 코드 전수조사 결과 + 사용법 Q&A + 수익화 전략 10개

---

## 목차

1. [프로젝트 정체 파악](#1-프로젝트-정체-파악)
2. [폴더 전수조사](#2-폴더-전수조사)
3. [데이터 흐름](#3-데이터-흐름)
4. [출력물 2종](#4-출력물-2종)
5. [쉬운 설명 (비유 버전)](#5-쉬운-설명-비유-버전)
6. [Q&A 7문항](#6-qa-7문항)
7. [수익화 전략 10개 모델](#7-수익화-전략-10개-모델)
8. [실행 로드맵](#8-실행-로드맵)
9. [발견된 개선 포인트](#9-발견된-개선-포인트)

---

## 1. 프로젝트 정체 파악

### 한 줄 정의

**AlignDev** = AI 코딩 시대의 **프론트엔드 컨벤션 생성기**.
7단계 비주얼 위저드에 체크하면 → **팀 개발 표준 문서(Markdown)** + **AI 에이전트용 `SKILL.md`** 두 개를 자동 생성하는 Next.js 웹앱.

### 해결하는 문제

팀에서 Claude Code / Cursor / GitHub Copilot / Windsurf를 **동시에** 사용하면
→ 에이전트마다 자기 해석대로 코드를 작성
→ 디렉토리 구조, 네이밍, 상태관리, UI 스타일이 **전부 따로 드리프트**

AlignDev는 **"모든 에이전트가 함께 읽는 단 하나의 계약서(contract)"** 를
사람이 읽을 수 있고(human-editable) 기계도 읽을 수 있는(machine-readable) 형태로 자동 생성한다.

### 중요한 구분

| | 역할 | 비유 |
|---|---|---|
| **AlignDev** | 규칙을 만든다 | 건축 설계 규정집 |
| **Claude Code / Cursor** | 그 규칙대로 코드를 짠다 | 실제 집 짓는 목수 |

AlignDev는 AI를 **대체**하는 도구가 아니라 AI를 **정렬(align)** 하는 도구다.
이름이 왜 **Align**Dev인지 여기서 드러난다.

### 규모

- 전체 **58개 파일 / 약 19,800줄**
- `package-lock.json` 제외 시 약 **6,600줄**
- 최대 파일: `lib/document-generator.ts` (**1,581줄**)

### 커밋 히스토리

```
a853195  Merge pull request #1 from bmshin94/feat/claude-guide
1f5101b  docs: appended CLAUDE.md persona guide
8acc6ac  修复 GitHub 链接和更新文档生成器中的目录结构
0f72ddd  optimize
44d2d98  fix domain
356b139  add logo and github link
9eea12c  first commit
```

---

## 2. 폴더 전수조사

### `/app` — Next.js App Router (화면 + API)

| 파일 | 줄수 | 역할 |
|---|---|---|
| `page.tsx` | 57 | `<WizardShell/>` 렌더 + **JSON-LD 구조화 데이터**(SoftwareApplication, WebSite) 삽입 → SEO |
| `layout.tsx` | 148 | 메타데이터 집약. `SITE_TITLE`, `SITE_DESCRIPTION`, **키워드 22개**, OpenGraph, Geist 폰트 2종 |
| `globals.css` | 130 | Tailwind v4 토큰 정의 (**`tailwind.config.js` 없음** — v4 CSS-first 방식) |
| `api/versions/route.ts` | 39 | **핵심 API.** npm 레지스트리에서 **33개 패키지 최신 메이저 버전**을 `Promise.all` 병렬 조회. 1시간 캐시(`revalidate: 3600`), 패키지별 fallback |
| `manifest.ts` | 30 | PWA 매니페스트 |
| `robots.ts` | 18 | 검색엔진 크롤링 설정 |
| `sitemap.ts` | 17 | 사이트맵 |

### `/types` — 타입 단일 소스

**`wizard.ts` (190줄)** — 이 프로젝트의 **헌법**

- `Framework`(5종), `Language`(2), `PkgMgr`(4), `BuildTool`(4), `I18n`(5), `TextDirection`(3)
- `ComponentLib`(11종), `CssSolution`(4), `IconLib`(4)
- `GlobalState`(7종), `ServerState`(5)
- `Linter`(3), `Formatter`(3), `PreCommit`(3), `TestingTool`(4), `CICD`(3)
- `DirPattern`(3), `DirDepth`(3), `FileNaming`(2), `ImportOrder`(2), `MaxFileLines`(3)
- **`ThemeStyle` 49종** (출처: `ui-ux-pro-max-skill`)
- `ColorDepth`(2), `SpacingBase`(2), `TokenConvention`(3), `TypographyScale`(4)
- `WizardState` 인터페이스 = 사용자 선택 **27개 필드**
- `STEP_LABELS` = 7단계 이름, `DEFAULT_WIZARD_STATE` = 기본값

모든 선택지가 **TypeScript 유니온 타입**으로 고정되어 있어 불가능한 값이 들어올 수 없다.

### `/lib` — 두뇌 (핵심 로직)

| 파일 | 줄수 | 역할 |
|---|---|---|
| **`document-generator.ts`** | **1,581** | 13개 섹션 함수(`s1Overview` ~ `s13I18n`)가 Markdown 조각 생성 후 `'\n\n---\n\n'`로 결합 |
| **`theme-tokens.ts`** | **754** | 49개 테마 프리셋. 각 테마마다 `palette` 5색 + `tokens` 12개 (bg/surface/primary/primaryFg/accent/text/textMuted/border/radius/shadow/fontWeight/fontFamily) |
| `wizard-store.ts` | 163 | **Zustand 스토어.** `WizardState` + `UIState` + `Actions`. `startGeneration()`이 오케스트레이터 |
| `skill-generator.ts` | 154 | `SKILL.md` 생성. YAML frontmatter + 워크플로 + 컴플라이언스 체크리스트 |
| `pkg-versions.ts` | 73 | `FALLBACK_VERSIONS` 33개 + `fetchVersions()` |
| `typography-utils.ts` | 64 | 타입 스케일 계산. `16px × ratio^exp` 로 4xl~xs 8단계 자동 생성 |
| `wcag-utils.ts` | 40 | **WCAG 2.0 명도대비 계산.** relative luminance → contrast ratio → AAA/AA/AA Large/Fail |
| `utils.ts` | 6 | shadcn `cn()` 유틸 |

### `/components` — UI 3단 레이아웃

```
WizardShell (3컬럼 고정 레이아웃)
├── 왼쪽 220px  : StepNav       → 7단계 사이드바 (sticky)
├── 중앙 flex-1 : StepForm      → 활성 스텝을 dynamic import로 lazy load
└── 오른쪽 360px: PreviewPanel  → 선택 변경 시마다 실시간 미리보기 (sticky)
```

| 파일 | 줄수 | 역할 |
|---|---|---|
| `wizard/wizard-shell.tsx` | 29 | 3컬럼 레이아웃 셸 |
| `wizard/step-form.tsx` | ~120 | `STEP_LOADERS` 배열로 7개 스텝 lazy load + 하단 네비게이션 바 |
| `wizard/step-nav.tsx` | — | 좌측 단계 표시기 |
| `wizard/steps/*.tsx` | 7개 | core-stack / ui-styles / state-management / toolchain / directory / naming-code / design-tokens |
| **`wizard/token-web-demo.tsx`** | **333** | 선택한 토큰으로 가짜 웹페이지를 실제로 렌더링하는 데모 |
| `preview/preview-panel.tsx` | 67 | 미리보기 ↔ 생성결과 전환, lazy import |
| `preview/generated-doc.tsx` | 114 | 탭 2개(Standards Document / SKILL.md) + Copy(clipboard) + Download(Blob→`a.download`). `react-markdown` + `remark-gfm` |
| `preview/selection-summary.tsx` | 119 | 현재 선택값 요약 |
| `preview/token-preview.tsx` | 118 | 토큰 + WCAG 배지 미리보기 |
| `shared/option-card.tsx` | — | 선택 카드 공통 컴포넌트 |
| `shared/section-header.tsx` | — | 섹션 헤더 공통 컴포넌트 |
| `ui/*.tsx` | 6개 | shadcn/ui 원본 (badge, button, card, progress, scroll-area, separator) |

### 루트 설정 파일

| 파일 | 내용 |
|---|---|
| `AGENTS.md` (5줄) | **"This is NOT the Next.js you know"** — Next.js 16 breaking change 경고. `node_modules/next/dist/docs/` 먼저 읽으라는 지시 |
| `CLAUDE.md` (77줄) | 아키텍처 설명 + 카리나 페르소나 설정 |
| `.claude/settings.local.json` | `npx tsc *`, `npx eslint *`, `grep *` 자동 허용 |
| `components.json` | shadcn/ui 설정 |
| `eslint.config.mjs` | flat config |
| `postcss.config.mjs` | `@tailwindcss/postcss` 플러그인 |
| `next.config.ts` | 빈 설정 (기본값) |
| `tsconfig.json` | strict mode, `@/*` 경로 별칭 |
| `.gitignore` | `/node_modules`, `/.next`, `.env*`, `.vercel` 등 |
| **`LICENSE`** | **없음** — README는 MIT라고 링크를 걸어뒀으나 실제 파일 부재 |

### 의존성

**production (15개)**
`next@16.2.7`, `react@19.2.4`, `react-dom@19.2.4`, `zustand@^5.0.14`,
`radix-ui@^1.4.3`, `lucide-react@^1.17.0`, `react-markdown@^10.1.0`,
`remark-gfm@^4.0.1`, `rehype-highlight@^7.0.2`, `shadcn@^4.10.0`,
`class-variance-authority@^0.7.1`, `clsx@^2.1.1`, `tailwind-merge@^3.6.0`,
`tw-animate-css@^1.4.0`

**dev (9개)**
`tailwindcss@^4`, `@tailwindcss/postcss@^4`, `@tailwindcss/typography@^0.5.19`,
`typescript@^5`, `eslint@^9`, `eslint-config-next@16.2.7`,
`@types/node@^20`, `@types/react@^19`, `@types/react-dom@^19`

---

## 3. 데이터 흐름

```
1. 사용자가 7단계 위저드에서 옵션 클릭
       ↓  setField / setTheme / toggleTesting / setToken
2. Zustand 스토어에 27개 필드 저장
       ↓  (오른쪽 PreviewPanel 실시간 갱신)
3. 마지막 스텝 → "Generate Standards" 클릭
       ↓  startGeneration()
4. Promise.all 로 3개 동시 실행
   ├─ import('document-generator')   ← 코드 스플리팅
   ├─ import('skill-generator')
   └─ fetchVersions() → /api/versions → npm registry 33개 병렬 조회
       ↓
5. generateDocument(선택값, 버전맵) → 13섹션 Markdown 문자열
   generateSkill(선택값, 버전맵)    → SKILL.md 문자열
       ↓
6. 스토어 저장 → 오른쪽 패널 탭 2개로 표시 → Copy / Download
```

### 설계상 영리한 포인트

**① 모듈 레벨 `_v` 변수 트릭**

```ts
let _v: VersionMap = {}
const mv = (pkg, fb) => _v[pkg] ?? FALLBACK_VERSIONS[pkg] ?? fb
const pd = (pkg, fb) => `"${pkg}": "^${mv(pkg, fb)}.x"`
```

생성 시작 시 `_v`에 실시간 버전을 주입하고 끝나면 `_v = {}`로 리셋.
1,581줄 생성기 전체에서 함수 인자를 넘기지 않고도 `mv('next', '16')` 호출 가능.
브라우저는 싱글 스레드라 안전하다.

**② 백틱 이스케이프 회피**

```ts
const B = '`'
const FENCE = B + B + B
```

템플릿 리터럴 안에서 Markdown 코드펜스를 쓰는 지옥을 상수로 해결.

**③ 섹션 번호 자동 재계산**

```ts
`### 8.${s.formatter !== 'biome' ? '3' : '2'} Husky + lint-staged Configuration`
```

선택에 따라 섹션이 빠지면 뒤 번호가 자동으로 당겨진다.

**④ 불가능한 조합 차단**

```ts
if (value === 'vue' || value === 'nuxt') {
  updates.componentLib = 'element-plus'
  updates.globalState  = 'pinia'
}
```

Vue 선택 시 shadcn/ui 같은 React 전용 조합을 코드가 막아준다.

**⑤ 전면 코드 스플리팅**

스텝 7개, 생성기 2개, 테마 토큰, 타이포 유틸, 미리보기 패널 전부 `dynamic import`.
초기 번들을 최소화한다.

---

## 4. 출력물 2종

### 출력물 1: `frontend-align.md` (개발 표준 문서)

**13개 섹션**, 선택에 따라 내용이 동적 분기.

| # | 섹션 | 내용 |
|---|---|---|
| 1 | Document Overview | 기술 스택 표, 표준 등급(`[Required]`/`[Recommended]`), 버전 관리 |
| 2 | Tech Stack | 버전 고정 전략, 빌드툴 표준, 의존성 규칙, 설치 명령어 |
| 3 | Directory | **feature-based / layer-based / monorepo** 3종 트리 (확장자 ts/js 자동 반영) |
| 4 | Naming | 네이밍 레퍼런스 표, 컴포넌트 파일 구조, 변수명 규칙 |
| 5 | Components | Server/Client 컴포넌트 판단 기준, Props 표준, 선택한 UI 라이브러리 사용법 |
| 6 | State Management | Zustand/Redux/Jotai/Context 예시 코드 + TanStack Query/SWR + **금지 안티패턴** |
| 7 | Styles | Tailwind 클래스 순서 / CSS Modules / SCSS 중 선택한 것, 반응형 브레이크포인트 |
| 8 | Toolchain | ESLint·Biome·OXC 설정 + Prettier + Husky/lint-staged 또는 Lefthook + tsconfig |
| 9 | Testing | 테스트 피라미드, 파일 네이밍, 품질 규칙 (미선택 시 "수동 테스트 체크리스트"로 전환) |
| 10 | Design Tokens | 테마 스타일, 기능색/중립색, 타이포그래피, 전체 토큰 정의, 스페이싱, 네이밍 |
| 11 | Git | 브랜치 네이밍, **Conventional Commits** (✅/❌ 예시), PR 체크리스트 |
| 12 | CI/CD | GitHub Actions 또는 GitLab CI 전체 YAML + 파이프라인 단계 설명 |
| 13 | i18n | (i18n 선택 시만) 디렉토리 구조, 키 네이밍, 설정 예시, **RTL/bidi 텍스트 방향** |

### 출력물 2: `SKILL.md` (AI 에이전트용)

```yaml
---
name: frontend-align-dev
description: >
  Use whenever writing, modifying, or reviewing frontend code in this project.
  Stack: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Zustand 5, TanStack Query v5.
  Triggers on any component, hook, store, style, or test file change.
---
```

구성 블록 7개:

1. **Dependency Bootstrap** — `ui-ux-pro-max-skill` 자동 설치 안내
   `npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max -y`
2. **Required reading** — `frontend-align.md` 먼저 읽을 것 (점진적 공개)
3. **Workflow 5단계** — 이해 → 구조 확인 → 구현 → 검증 명령 실행 → 컴플라이언스 리뷰
4. **검증 명령** — `pnpm lint` / `npx tsc --noEmit` / `pnpm test` (선택값에 따라 변동)
5. **Compliance checklist** — 선택 스택에 맞춰 8~10개 항목 자동 생성
6. **Final response format** — 에이전트 보고 형식 강제
7. **트리거 조건** — `description`에 발동 시점 명시

### 생성물 배치 위치

```
내-프로젝트/
├── SKILL.md              ← AI가 자동으로 읽음
├── frontend-align.md     ← SKILL.md가 "이거 먼저 읽어" 라고 지시
├── CLAUDE.md             ← (Claude Code 전용 추가 설정)
├── .cursorrules          ← (Cursor 쓰면 여기에 복사)
├── package.json
└── src/
```

---

## 5. 쉬운 설명 (비유 버전)

### 식당 비유

| 식당 | 실제 개발 |
|---|---|
| 알바생 4명 | AI 코딩 에이전트 (Claude Code, Cursor, Copilot, Windsurf) |
| "김치찌개 만들어줘" | "로그인 페이지 만들어줘" |
| 참치 vs 돼지고기 vs 스팸 | Zustand vs Redux, kebab-case vs camelCase, `components/` vs `features/` |
| 주방 벽에 붙인 한 장 요약 | 레포 루트의 `SKILL.md` |
| 두꺼운 레시피 북 | 팀에 공유하는 `frontend-align.md` |
| **맛이 통일됨** | **코드 스타일이 통일됨** |

매뉴얼 없이 실력 좋은 알바 4명을 쓰면 각자 다른 맛이 나온다.
7장짜리 설문지(= 7단계 위저드)에 체크하면 레시피 북과 벽에 붙일 요약이 나오고,
알바 4명 전부 같은 종이를 읽고 요리하니 맛이 통일된다.

### 7단계 산책

**1단계 Core Stack** — 프레임워크 / 언어 / 패키지 매니저 / 빌드툴 / 다국어 / 텍스트 방향
**2단계 UI & Styles** — 컴포넌트 라이브러리 11종 / CSS 방식 4종 / 아이콘 4종
**3단계 State Management** — 전역 상태 7종 + 서버 상태 5종
　(전역 = "로그인한 사용자 이름", 서버 = "상품 목록 API 응답". 성질이 달라서 도구를 분리)
**4단계 Toolchain** — 린터 / 포매터 / 커밋 전 검사 / 테스트(복수 선택) / CI·CD
**5단계 Directory** — feature-based / layer-based / monorepo + 깊이 2·3·4
**6단계 Naming & Code** — 파일명 규칙 / import 순서 / 파일 최대 줄수
**7단계 Design Tokens** — 49개 테마 + WCAG 체크 + 타이포 스케일 + 실시간 웹 데모

### 49개 테마 예시

| 스타일 | 느낌 | 용도 |
|---|---|---|
| Minimalism | 흰 배경, 각진 모서리(0px), 그림자 없음 | 대시보드, 기업용 앱 |
| Glassmorphism | 반투명 유리, 블러 | 트렌디한 랜딩 |
| Neumorphism | 푹신한 양각, 안쪽+바깥쪽 그림자 | 명상/헬스 앱 |
| Brutalism | 두꺼운 검은 테두리, 날것 | 포트폴리오 |
| Cyberpunk | 네온, 어두운 배경 | 게임 |
| E-ink | 전자책 흑백 | 읽기 앱 |
| Y2K / Vaporwave | 2000년대 레트로 | 음악/패션 |
| ... 외 42개 | | |

### WCAG 명도대비 자동 판정

| 비율 | 등급 | 의미 |
|---|---|---|
| 7.0 이상 | `AAA` | 최고 |
| 4.5 이상 | `AA` | 합격 |
| 3.0 이상 | `AA Large` | 큰 글자만 합격 |
| 그 이하 | `Fail` | 탈락 |

눈이 불편한 사람도 읽을 수 있게 하는 국제 접근성 표준.
미국·유럽·공공기관에서는 법적 요구사항이다.

### 타이포그래피 스케일

```
Minor Third    ×1.2    → 촘촘함 (데이터 많은 UI)
Major Third    ×1.25   → 균형 (기본 추천)
Perfect Fourth ×1.333  → 대비 강함 (콘텐츠 많은 서비스)
Major Sixth    ×1.5    → 화려함 (브랜드/마케팅)
```

계산식 `16px × 비율^단계` → 8단계(4xl ~ xs) 자동 산출.
Major Third 기준: xs 10.2 / sm 12.8 / **base 16** / lg 20 / xl 25 / 2xl 31.3 / 3xl 39.1 / 4xl 48.8 (px)

### 실시간 npm 버전 조회가 중요한 이유

AI는 학습 데이터 시점이 있어 "Next.js 최신은 14" 같은 과거 정보를 말할 수 있다.
문서에 `"next": "^16.x"`가 박혀 있으면 AI가 그것을 기준으로 정확히 작업한다.
npm이 응답하지 않아도 `FALLBACK_VERSIONS`로 폴백하므로 생성이 실패하지 않는다.

---

## 6. Q&A 7문항

### Q1. 설치 및 사용법?

#### 방법 A: 웹사이트로 사용

배포 주소 기본값이 `https://aligndev.dev` (`NEXT_PUBLIC_SITE_URL`).
접속 → 7단계 체크 → 다운로드. 설치 불필요.

#### 방법 B: 로컬 실행

```bash
# 0) 사전 준비 — Next.js 16은 Node 20.9+ 필요 (검증 환경: Node v22.22.0)
node -v

# 1) 클론
git clone https://github.com/bmshin94/aligndev.git
cd aligndev

# 2) 설치 (package-lock.json 있으므로 npm 권장)
npm install
# 또는 npm ci     ← lock 그대로 정확히 재현 (CI용)

# 3) 개발 서버
npm run dev        # → http://localhost:3000

# 4) 프로덕션
npm run build
npm start

# 5) 린트
npm run lint
```

- `package.json`에 `engines` 필드 없음 → Node 20 이상 권장
- **테스트 스위트 없음** (`CLAUDE.md`에 "No test suite is configured" 명시)

#### 환경변수 (선택)

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://내도메인.com
```

메타데이터 / sitemap / robots / JSON-LD의 기준 URL.
미설정 시 기본값으로 동작하므로 없어도 실행된다.

#### 배포

Vercel 권장 (`.gitignore`에 `.vercel` 존재 → 원래 Vercel 배포 프로젝트).

```bash
npm i -g vercel && vercel
```

**주의**: 정적 export(`output: 'export'`)나 순수 정적 호스팅은 불가.
`/api/versions` Route Handler가 Node 런타임을 요구한다.

#### 결과물 사용

```
1. 7단계 체크 → "Generate Standards"
2. 오른쪽 패널 탭 2개:
   ├── [Standards Document] → Download → frontend-align.md
   └── [SKILL.md]           → Download → SKILL.md
3. 두 파일을 프로젝트 루트에 복사
4. Claude Code / Cursor 실행 → 자동 적용
```

---

### Q2. 플러그인? 스킬? MCP?

**셋 다 아니다. "스킬을 만들어주는 웹앱"이다.**

| 구분 | 해당? | 근거 |
|---|---|---|
| 플러그인 | **아니다** | `.claude-plugin/plugin.json`, marketplace 등록, commands/agents/hooks 디렉토리 전부 없음 |
| 스킬 | **"스킬 생성기"** | `SKILL.md`를 출력하는 공장. 자기 자신이 스킬은 아님 |
| MCP 서버 | **아니다** | MCP SDK 의존성 없음, `tools/list`·`tools/call` 핸들러 없음, stdio/SSE 트랜스포트 없음 |
| 웹 애플리케이션 | **정답** | Next.js 16 App Router 기반 독립 웹앱 |

#### 개념 정리

```
Skill   = AI에게 주는 지시문 문서 (SKILL.md, 텍스트. 실행 코드 없음)
Plugin  = Claude Code 기능 확장 패키지 (plugin.json + skills/ + commands/ + agents/ + hooks/)
MCP     = AI에게 새 도구를 주는 서버 프로토콜 (stdio / HTTP+SSE, tools/call로 함수 호출)
AlignDev= SKILL.md를 생성해주는 웹사이트
```

비유: Skill = 레시피 종이 / Plugin = 레시피+도구+앞치마 세트 박스 / MCP = 주방에 설치하는 오븐 / AlignDev = 레시피를 인쇄해주는 프린터.

#### 참고

AlignDev가 생성하는 `SKILL.md`는 `ui-ux-pro-max-skill`이라는 **다른 스킬에 의존**한다.
49개 테마 스타일도 그 출처(`source: '#1 · ui-ux-pro-max'`)에서 가져온 것.
즉 스킬 생태계 위에 올라탄 생성기다.

#### 확장 가능성

```
1) Claude Code 플러그인화 → /align-init 슬래시 커맨드, 터미널 대화형 생성
2) MCP 서버화             → generate_frontend_standards() 등 tool 제공, AI가 직접 호출
3) CLI화                  → npx aligndev init
```

---

### Q3. API 토큰이 필요한가?

**전혀 필요 없다.** 코드 전체에 인증 관련 코드가 0줄.

```
API 키 / 토큰 환경변수      → 없음
Authorization 헤더          → 없음
OAuth / 로그인 / 세션       → 없음
데이터베이스 연결           → 없음
LLM API 호출 (Claude/GPT)   → 없음  ★
유료 서비스 연동            → 없음
환경변수                    → NEXT_PUBLIC_SITE_URL 1개 (SEO용, 선택)
```

#### 외부 통신 2곳

**1) npm 레지스트리 — 인증 불필요 공개 API**

```ts
await fetch(`https://registry.npmjs.org/${pkg}/latest`, {
  next: { revalidate: 3600 }   // 1시간 서버 캐시
})
```

- 완전 공개 API. 토큰·요금·가입 없음
- 실패 시 패키지별 `FALLBACK_VERSIONS` 폴백
- 33개를 `Promise.all` 병렬 조회
- **서버 사이드 전용** 호출 → 브라우저 CORS 문제 없음

**2) Google Fonts** — `next/font/google`로 빌드 타임 다운로드 후 self-host. 런타임에 외부 요청 없음.

#### LLM API를 안 쓰는 설계의 장점

`document-generator.ts` 1,581줄이 전부 템플릿 리터럴 + 조건 분기다.

| 장점 | 설명 |
|---|---|
| 비용 0원 | 토큰 과금 없음. 트래픽 증가 시 서버비만 |
| 즉시 생성 | LLM 대기 없음. 밀리초 단위 |
| 100% 재현성 | 같은 선택 → 항상 같은 결과 (버전 제외) |
| 환각 없음 | 존재하지 않는 API를 생성할 위험 0 |
| 프라이버시 | 선택값이 외부 LLM으로 전송되지 않음 |
| 기업 도입 용이 | 보안 심사 통과 쉬움 |

수익화 관점에서 "AI 도구인데 AI API 비용이 0원" = **마진 100%** 라는 강력한 무기다.

---

### Q4. AI 에이전트 구축에 도움이 되는가?

**직접적으로는 아니고, 간접적으로는 매우 크다.**

#### 직접적으로 없는 것

```
LLM API 호출 레이어 / 툴 호출 정의(tool use) / 에이전트 루프(ReAct, plan-execute)
멀티에이전트 오케스트레이션 / 메모리·벡터DB·RAG / MCP 서버 구현
```

이런 기능은 **Claude Agent SDK** 또는 **Claude API (Messages + Tool Runner)** 영역이다.

#### 간접적 가치 4가지

**① 컨텍스트 엔지니어링 실전 교본**

`SKILL.md`의 7블록이 에이전트 지시문 설계의 정석이다.

1. 트리거 조건 명시 → 언제 이 능력을 쓸지 AI가 판단 가능
2. **점진적 공개(progressive disclosure)** → SKILL.md는 짧게, 상세는 별도 문서 → 컨텍스트 윈도우 절약
3. 자기 검증 루프 → 체크리스트로 스스로 리뷰 → 환각·누락 방지
4. 출력 형식 강제 → 파싱 가능한 응답 → 파이프라인 연결 가능
5. 실행 가능한 검증 → `npx tsc --noEmit` 같은 객관적 통과/실패 기준

**② 멀티 에이전트의 공유 규약(Constitution 패턴)**

```
Before: Agent A는 camelCase, Agent B는 kebab-case, Agent C는 판단 불가
After : A·B·C 전부 frontend-align.md를 읽음 → 통일
```

**③ 결정론적 생성 아키텍처 (비용 절감 핵심)**

```
구조화된 입력(27개 필드)
   ↓ 템플릿 + 조건 분기 (코드, 0원)
구조화된 출력
   ↓ LLM은 "창의적 판단"만 담당
```

실무 에이전트의 핵심은 **"LLM을 쓸 곳과 안 쓸 곳을 구분하기"** 다.

**④ 에이전트 도구용 스키마 설계 참고**

```ts
export type Framework = 'nextjs' | 'react-spa' | 'vue' | 'nuxt' | 'svelte'
```

→ JSON Schema로 변환하면 MCP tool definition이 된다.

```json
{
  "name": "generate_frontend_standards",
  "input_schema": {
    "type": "object",
    "properties": {
      "framework": { "enum": ["nextjs","react-spa","vue","nuxt","svelte"] },
      "linter":    { "enum": ["eslint","biome","oxc"] }
    }
  }
}
```

유니온 타입 = enum = AI가 헷갈릴 여지 0. 자유 텍스트보다 훨씬 안정적이다.

#### 활용 체크리스트

```
1) SKILL.md 구조를 → 내 에이전트 시스템 프롬프트 템플릿으로
2) "Required reading" 패턴을 → RAG 참조 전략으로
3) Compliance checklist를 → 에이전트 자기평가 루프로
4) 27개 유니온 타입을 → tool input schema로
5) 결정론적 생성을 → 토큰 비용 절감 전략으로
6) AlignDev 자체를 → 내 에이전트의 MCP 도구로 래핑
```

---

### Q5. 수익화할 만한 아이디어가 있는가?

있다. 상세는 [7장](#7-수익화-전략-10개-모델) 참고. 요약:

| 등급 | 아이디어 | 난이도 | 수익 규모 |
|---|---|---|---|
| 1 | Team SaaS (저장/공유/버전/CI 연동) | 중 | $19~199/mo |
| 1 | CLI + Cloud 하이브리드 | 중 | 구독 |
| 2 | 프리미엄 템플릿 마켓플레이스 | 낮 | 건당 판매 |
| 2 | 유튜브 + 교육 상품 | 낮 | 광고 + 판매 |
| 3 | 기업 컨설팅 / 커스텀 구축 | 높음 | 프로젝트 단위 |

**최대 무기 2개**
1. LLM API 비용 0원 → 마진 100%
2. 시장 타이밍 → AI 코딩 에이전트 폭발 성장기, 경쟁자 희소

---

### Q6. React나 PHP로 만들 수 있는가?

#### React — 이미 React 기반

현재: Next.js 16 (App Router) + React 19.2 + TypeScript

**순수 React(Vite SPA)로 포팅 시 재사용률 약 90%**

| 현재 | 순수 React |
|---|---|
| `app/page.tsx` | `App.tsx` |
| `app/layout.tsx` (메타데이터) | `index.html` + react-helmet |
| `app/api/versions/route.ts` | **유일한 문제** |
| `components/**` (17개) | 그대로 재사용 |
| `lib/**` (8개, 생성기 전부) | 그대로 재사용 |
| `types/wizard.ts` | 그대로 재사용 |
| Zustand 스토어 | 그대로 재사용 |

핵심 로직(생성기 약 2,500줄)은 프레임워크 의존성이 0인 순수 TypeScript 함수다.

**API 문제 해결법 3가지**

```
① 브라우저에서 직접 npm 호출
   registry.npmjs.org는 CORS 허용 → fetch 바로 가능
   → 서버 불필요 → GitHub Pages 무료 배포 가능  ★ 추천
② Vercel Serverless Function 하나만 유지
③ FALLBACK_VERSIONS만 사용 (완전 정적, 월 1회 수동 갱신)
```

#### PHP — 가능. 3가지 접근법

**방법 A: PHP 백엔드 + 바닐라 JS**

```
aligndev-php/
├── index.php                  # 7단계 폼
├── generate.php               # POST → 문서 생성
├── api/versions.php           # npm 조회 + APCu 캐시
├── src/
│   ├── WizardState.php
│   ├── DocumentGenerator.php  # 13섹션 (heredoc)
│   ├── SkillGenerator.php
│   ├── ThemeTokens.php        # 49개 프리셋
│   ├── TypographyUtils.php
│   └── WcagUtils.php
├── public/{app.js,style.css}
└── composer.json
```

PHP의 `heredoc`이 JS 템플릿 리터럴과 동일하게 동작하므로 생성기 이식이 자연스럽다.

```php
private function mv(string $pkg, string $fb): string {
    return $this->versions[$pkg] ?? FALLBACK_VERSIONS[$pkg] ?? $fb;
}

private function s1Overview(): string {
    $fw = $this->frameworkName();
    $date = date('Y-m-d');
    return <<<MD
    # {$fw} Frontend Development Standards

    > Version: 1.0.0 | Last updated: {$date}
    MD;
}
```

npm 병렬 조회는 `curl_multi_init()` + `apcu_store(..., 3600)` 으로 `revalidate: 3600`을 대체한다.

**방법 B: Laravel + Blade/Livewire (추천)**

TS 유니온 타입 → PHP 8.1 enum 변환이 1:1로 맞아떨어진다.

```php
enum Framework: string {
    case NextJs   = 'nextjs';
    case ReactSpa = 'react-spa';
    case Vue      = 'vue';
    case Nuxt     = 'nuxt';
    case Svelte   = 'svelte';

    public function defaultComponentLib(): ComponentLib {
        return match($this) {
            self::Vue, self::Nuxt => ComponentLib::ElementPlus,
            default               => ComponentLib::Shadcn,
        };
    }
}
```

Livewire로 실시간 미리보기를 JS 거의 없이 구현 가능 (Zustand 구독과 동일한 효과).

**방법 C: 하이브리드 (수익화 시 최적)**

```
프론트엔드: React (현재 코드 유지)
백엔드:     Laravel API → 저장/인증/결제/팀 기능
생성 로직:  프론트에서 실행 → 서버 부하 0
```

#### 비교

| | Next.js (현재) | 순수 React | PHP (Laravel) |
|---|---|---|---|
| 재사용률 | — | **90%** | 0% (재작성) |
| 작업량 | — | 1~2일 | 2~4주 |
| 호스팅 | Vercel | **GitHub Pages 무료** | 일반 웹호스팅 |
| SEO | 최고 | 약함 | 좋음 |
| 실시간 미리보기 | 가능 | 가능 | Livewire 필요 |
| 결제/인증/팀 | 추가 필요 | 추가 필요 | **Laravel 내장** |
| 한국 호스팅 | 제한적 | 어디든 | 카페24/가비아 가능 |

#### 상황별 추천

```
학습 목적        → PHP 포팅 (로직 완전 이해)
빠른 배포        → 순수 React + GitHub Pages (무료, 1~2일)
수익화           → 현재 Next.js 유지 + Laravel API 추가
한국 시장 타깃   → Laravel (PG 연동, 호스팅 저렴)
```

---

### Q7. 유튜브 강의 영상으로 제작 가능한가?

**가능하며 소재로 매우 적합하다.**

#### 소재로 좋은 이유

| 이유 | 설명 |
|---|---|
| 시장 타이밍 | "AI 코딩" 검색량 급증, 경쟁 콘텐츠 희소 |
| 시각적 임팩트 | 49개 테마 실시간 전환 = 썸네일/숏츠 최적 |
| 난이도 스펙트럼 | 입문(사용법) ~ 고급(Next.js 16 아키텍처) |
| 즉시 결과 | 3분 만에 문서 2개 → 완주율 높음 |
| 비용 0원 | API 키/결제 불필요 → 시청자 이탈 없음 |
| 분할 용이 | 58개 파일 / 13섹션 → 시리즈화 쉬움 |
| 한국어 블루오션 | 이 주제 한국어 콘텐츠 거의 없음 |

#### 트랙 A: 입문 (3편)

| 편 | 제목 | 길이 | 내용 |
|---|---|---|---|
| 1 | AI가 맨날 다른 스타일로 코딩하는 이유 | 10분 | 문제 정의. 같은 요청 → 다른 결과 실연 |
| 2 | 3분 만에 팀 컨벤션 문서 만들기 | 12분 | 7단계 라이브 + 49테마 쇼케이스 |
| 3 | SKILL.md 넣고 AI 코딩 Before/After | 15분 | 핵심. 규칙 적용 전후 비교 |

#### 트랙 B: 실전 클론코딩 (8편)

| 편 | 제목 | 길이 | 핵심 기술 |
|---|---|---|---|
| 1 | 프로젝트 셋업 & Next.js 16 달라진 점 | 20분 | App Router, Turbopack, AGENTS.md 경고의 의미 |
| 2 | Tailwind v4 — config 파일이 사라졌다 | 18분 | CSS-first, `@theme`, PostCSS 플러그인 |
| 3 | shadcn/ui 구조 완전 이해 | 20분 | "복사해서 쓰는" 철학, CVA, `cn()` |
| 4 | Zustand 5로 복잡한 폼 상태 관리 | 25분 | 27필드 스토어, 슬라이스 패턴, 비동기 액션 |
| 5 | 3컬럼 sticky 레이아웃 + 실시간 미리보기 | 22분 | sticky, overflow 트랩, dynamic import |
| 6 | 1,581줄 문서 생성 엔진 만들기 | 35분 | 템플릿 리터럴, `B`/`FENCE` 트릭, 모듈 `_v` 패턴, 섹션 번호 자동 계산 |
| 7 | npm API 병렬 조회 + 캐싱 + 폴백 | 25분 | Route Handler, `Promise.all`, `revalidate` |
| 8 | SEO 풀세트 + Vercel 배포 | 25분 | JSON-LD, metadata, sitemap, robots, manifest |

#### 트랙 C: 심화 (5편)

| 편 | 제목 | 길이 | 내용 |
|---|---|---|---|
| 1 | 컨텍스트 엔지니어링이란? | 18분 | 프롬프트 ≠ 컨텍스트. SKILL.md 7블록 해부 |
| 2 | Skill vs Plugin vs MCP 완전 정리 | 20분 | 3개 차이 + 실습 (검색 수요 높음) |
| 3 | AlignDev를 MCP 서버로 만들기 | 30분 | TS 유니온 → JSON Schema → tool 구현 |
| 4 | WCAG 접근성 — 코드로 계산하기 | 22분 | `wcag-utils.ts` 40줄 수학 해부 |
| 5 | 디자인 토큰 & 타이포 스케일 수학 | 25분 | 49테마 체계, `16 × ratio^exp` |

#### 터질 가능성 높은 영상 TOP 3

**1위: "AI한테 코딩 규칙 안 주면 이렇게 됩니다" (Before/After)**

```
0:00  훅 — 같은 프롬프트, 3개 AI, 완전 다른 결과
0:45  문제 정의
2:00  AlignDev 7단계 (타임랩스)
4:00  SKILL.md 적용
4:30  같은 프롬프트 재시도 → 3개 AI 결과 일치
6:00  원리 설명
8:00  마무리 + 레포 링크
썸네일: 왼쪽 "제각각" / 오른쪽 "통일"
```

**2위: "디자인 스타일 49개를 1분에" (숏츠)** — TokenWebDemo 전환 애니메이션만 연속 재생

**3위: "Skill? Plugin? MCP? 1편으로 끝내기"** — 검색 수요 확실, 비유 그래픽 활용

#### 제작 팁

**권장**
- Before/After 실연 필수 (이 콘텐츠의 생명)
- 코드 폰트 16px 이상, 다크 테마
- 첫 15초에 완성 결과 먼저 노출
- 설명란에 레포 링크 + 챕터 타임스탬프
- "어떤 스택 쓰세요?" 댓글 유도

**주의**
- **라이선스**: README는 MIT라고 하는데 `LICENSE` 파일이 실제로 없음 → 영상 전 추가
- **버전 변동**: npm 실시간 조회라 영상과 시청자 화면이 다를 수 있음 → 고지 필요
- **크레딧**: 49테마는 `ui-ux-pro-max-skill` 출처 명시
- **용어 풀어쓰기**: "컨벤션" → "코딩 규칙", "토큰" → "색/크기 설정값"

#### 유튜브 → 수익 퍼널

```
무료 영상 (유입)
   ↓
Notion 템플릿 / 치트시트 (리드 수집)
   ↓
유료 강의 (인프런/클래스101)
   ↓
AlignDev Pro 구독
   ↓
기업 교육 / 컨설팅
```

---

## 7. 수익화 전략 10개 모델

### 강점 / 약점

#### 강점

| # | 강점 | 중요성 |
|---|---|---|
| 1 | **LLM API 비용 0원** | 마진 100%. 경쟁사는 토큰비 부담, 우리는 서버비만 |
| 2 | **시장 타이밍** | AI 코딩 에이전트 폭발 성장기. "에이전트 정렬" 카테고리 선점 가능 |
| 3 | **명확한 페인포인트** | "AI가 제각각 코딩한다" = 사용자 전원이 공감하는 실제 고통 |
| 4 | **즉시 가치 체감** | 3분 → 문서 2개. 데모에서 바로 설득 |
| 5 | **기업 도입 장벽 낮음** | 데이터가 외부 LLM으로 안 나감 → 보안 심사 통과 쉬움 |
| 6 | **확장 축 명확** | 프론트 → 백엔드 → 모바일 → 데브옵스 → 데이터 |
| 7 | **반복 사용 구조** | 프로젝트마다, 스택 변경마다 재방문 |
| 8 | **글로벌 즉시 가능** | 이미 영문 |

#### 약점과 해결책

| # | 약점 | 해결책 |
|---|---|---|
| 1 | 현재 100% 무료 + 저장 없음 | 로그인/저장이 **유료화 1호 기능** |
| 2 | 복제 쉬움 (템플릿 기반) | 커뮤니티/데이터/통합으로 네트워크 효과 |
| 3 | 락인 없음 — 한 번 받으면 끝 | **준수율 추적**으로 지속 가치 확보 |
| 4 | 프론트엔드만 | 영역 확장 |
| 5 | 측정 수단 없음 | 준수율 리포트 = 최강 락인 기능 |

> **핵심 인사이트**: "문서 생성"은 일회성이라 구독으로 묶이지 않는다.
> 하지만 **"문서와 코드의 동기화 유지"** 는 영구 구독이 된다.

---

### 모델 1: Team SaaS — "AlignDev Cloud" (메인 추천)

#### 가격

| 플랜 | 가격 | 포함 |
|---|---|---|
| Free | $0 | 현재 기능 전부(생성/다운로드), 저장 1개 |
| **Pro** | **$19/mo** | 무제한 저장, 버전 히스토리, Private 링크 공유, 커스텀 테마 저장, PDF/Notion/Confluence export |
| **Team** | **$49/mo** (5석) | 팀 워크스페이스, 역할 권한, 승인 워크플로, Slack/Discord 알림, 변경 이력 감사 |
| **Business** | **$199/mo** | SSO/SAML, 조직 템플릿 강제, 준수율 대시보드, 감사 로그 |
| Enterprise | 문의 | 온프레미스, 커스텀 섹션, SLA, 전담 지원 |

#### 구현 로드맵

```
Phase 1 (2주) — 인증 + 저장
  NextAuth / Clerk → GitHub OAuth (개발자 타깃이라 전환율 높음)
  Postgres(Neon/Supabase) + Prisma
  /dashboard — 내 표준 목록

Phase 2 (2주) — 공유 + 버전
  공유 링크 aligndev.dev/s/{slug}
  버전 히스토리 + diff 뷰 (어떤 규칙이 언제 바뀌었나)
  팀 초대

Phase 3 (2주) — 결제
  Stripe (글로벌) / 토스페이먼츠·포트원 (한국)
  Webhook → 플랜 동기화
  사용량 제한 미들웨어

Phase 4 (3주) — 락인 기능
  GitHub App → 레포에 SKILL.md 자동 PR
  스택 변경 감지 → "Next.js 17 출시, 문서 갱신할까요?" 알림
  준수율 리포트 (모델 4)
```

#### Value Prop

```
Free     "문서 받았다. 끝." → 재방문 없음
Pro      "6개월 전 만든 규칙을 다시 수정해야 하는데 저장돼 있다"
Team     "팀 10명이 같은 링크를 보고, 바뀌면 Slack 알림이 온다"
Business "우리 조직 15개 레포 준수율이 대시보드에 보인다"
```

#### 보수적 매출 시나리오

```
월 방문 10,000명 (유튜브 + SEO)
  → 가입 전환 5%      = 500명
  → 유료 전환 3%      = 15명
  → Pro $19 × 15      = $285/mo
  + Team $49 × 5팀    = $245/mo
  합계 약 $530/mo (약 70만원)

서버비: Vercel $20 + Neon $19 = $39
  → 순이익 약 $490/mo (마진 92%)

트래픽 10배(월 10만)  → 약 $5,000/mo
```

---

### 모델 2: CLI + Cloud 하이브리드

개발자는 브라우저보다 터미널을 선호한다. 성장 엔진이 될 수 있다.

```bash
# 무료 — 대화형 생성
npx aligndev init

# 무료 — 기존 코드 분석해서 추천 (킬러 기능)
npx aligndev detect
  package.json 분석: Next.js 16, Zustand 5, Tailwind 4
  파일명 패턴 분석: kebab-case (87% 일치)
  폴더 구조 분석: feature-based
  → 선택값 자동 채움

# Pro — 클라우드 동기화
npx aligndev pull --team acme
npx aligndev push
npx aligndev diff

# Pro — CI 검사
npx aligndev check --strict
  ✖ src/Components/UserCard.tsx  파일명이 kebab-case 아님
  ✖ src/features/auth/index.ts   420줄 — 최대 300줄 초과
  → 준수율 94% (2건 위반) → exit code 1
```

#### 수익 구조

```
무료: init, detect, 로컬 생성        ← 바이럴 엔진
유료: pull/push/diff/check, 팀 동기화 ← 구독
```

#### 전략적 가치

- `npx aligndev` = 진입장벽 0 → 입소문 빠름
- `aligndev check`가 CI에 들어가면 매일 실행됨 → 이탈 불가 락인
- npm 다운로드 수 = 신뢰 지표 + SEO

---

### 모델 3: Claude Code Plugin / MCP 서버 (생태계 선점)

플러그인/스킬 마켓플레이스가 열리는 초기 단계라 선점 가치가 크다.

#### A. Claude Code 플러그인

```
.claude-plugin/plugin.json
├── commands/
│   ├── align-init.md      # /align-init  → 대화형 7단계
│   ├── align-check.md     # /align-check → 현재 코드 준수율
│   └── align-sync.md      # /align-sync  → 팀 표준 동기화
├── skills/frontend-align/SKILL.md
├── agents/convention-reviewer.md   # PR 리뷰 전용 에이전트
└── hooks/post-write.json           # 파일 쓸 때마다 네이밍 자동 검사
```

#### B. MCP 서버 tools

```
generate_frontend_standards(선택값)  → 전체 표준 문서       (무료)
generate_skill_md(선택값)            → SKILL.md            (무료)
get_latest_versions()                → npm 최신 버전맵      (무료)
list_theme_presets()                 → 49개 테마 목록       (무료)
check_compliance(파일경로[])         → 위반 리포트          (유료)
get_team_standard(팀ID)              → 팀 표준 조회         (유료)
```

#### 왜 강력한가

```
브라우저 방식: 사람이 사이트 방문 → 다운로드 → 복사 (수동, 1회성)
MCP 방식:      AI가 스스로 호출 → 매 작업마다 사용 (자동, 반복)
```

**AI 에이전트 자체가 고객이 되는 구조** = 새로운 시장.

---

### 모델 4: 준수율 분석 리포트 (최강 락인 기능)

"일회성 생성기"를 "영구 구독"으로 바꾸는 열쇠.

#### PR 자동 코멘트

```
AlignDev 컨벤션 리포트
준수율: 94% (▲ 2% from main)

위반 2건
 • src/Components/UserCard.tsx   파일명 kebab-case 위반 (§4.1)
 • src/features/auth/index.ts    420줄 — 최대 300줄 초과 (§6.3)

경고 1건
 • useEffect 내 직접 fetch 발견 (§6.3 금지 안티패턴) → TanStack Query 사용

통과 48건
팀 추이: 4주 전 81% → 현재 94%
```

#### 관리자 대시보드 (Business)

```
조직 전체 준수율: 91%
  web-app      96%
  admin-panel  88%
  legacy-app   62%  ← 우선 개선 대상
위반 TOP 3
  1. 파일 네이밍 (43건)
  2. 파일 길이 초과 (28건)
  3. 직접 fetch 사용 (19건)
→ 교육 자료 자동 추천
```

#### 왜 최강인가

```
"문서 생성"   → 받으면 끝 → 해지
"준수율 추적" → 매 PR마다 가치 → 해지하면 가시성 상실 → 락인
```

#### 구현

```
1. frontend-align.md → 머신리더블 규칙 JSON 변환
   { "rule": "file-naming", "value": "kebab-case", "section": "4.1" }
2. ESLint 커스텀 플러그인 (eslint-plugin-aligndev)
3. GitHub App + Checks API → PR 코멘트
4. 결과를 DB에 쌓아 추이 분석
```

범용 린터가 대체 못 한다. **"우리 팀이 직접 정한 규칙"** 을 검사하기 때문.

#### 가격

```
Team       $49/mo   — 레포 5개
Business   $199/mo  — 무제한 + 조직 대시보드 + 감사 로그
Enterprise 문의     — 온프레미스 + 커스텀 규칙 엔진
```

---

### 모델 5: 프리미엄 템플릿 마켓플레이스

| 상품 | 가격 | 내용 |
|---|---|---|
| Enterprise Next.js Pack | $49 | 대기업용 보안/감사/접근성 섹션 추가 |
| Startup MVP Pack | $29 | 속도 우선, 최소 규칙 |
| Design System Pack | $79 | Figma 토큰 동기화 + Storybook + 49테마 Figma 파일 |
| Fintech Compliance Pack | $149 | PCI-DSS, 감사 로그, 보안 코딩 표준 |
| 접근성 완전판 (WCAG 2.2 AA) | $69 | 법적 요구사항 충족 체크리스트 |
| Backend Standards Pack | $59 | Node/NestJS/Spring/Laravel 백엔드 표준 |
| Monorepo Mastery Pack | $49 | Turborepo/Nx 심화 + 패키지 경계 규칙 |

**커뮤니티 마켓플레이스 확장**: 누구나 자기 팀 표준을 업로드·판매, AlignDev 수수료 20~30%.
템플릿이 많아질수록 플랫폼 가치가 올라가고, 코드는 복제 가능하지만 커뮤니티는 복제 불가하다.

장점: 구현 난이도 최저, 구독 저항층도 일회성 구매는 함, 수요 검증용으로 최적.

---

### 모델 6: 교육 상품

| 상품 | 가격 | 플랫폼 |
|---|---|---|
| 유튜브 무료 시리즈 | $0 | 유튜브 (유입 + 광고) |
| "AI 협업 개발 실전" 강의 | ₩99,000 | 인프런 / 유데미 / 클래스101 |
| Notion 템플릿 번들 | ₩19,000 | 7단계 체크리스트 + 치트시트 |
| 라이브 워크샵 (3시간) | ₩150,000/인 | Zoom, 10~20명 |
| 기업 사내교육 (1일) | ₩2,000,000~ | 출장/온라인 |
| 유료 뉴스레터 | $5/mo | AI 코딩 주간 동향 + 템플릿 |

#### 유료 강의 커리큘럼 (21시간)

```
Part 1. AI 코딩 시대의 문제                (2시간)
Part 2. 컨텍스트 엔지니어링 기초            (3시간)  SKILL.md 7블록 설계법
Part 3. Next.js 16 + Tailwind v4 실전      (6시간)  AlignDev 클론코딩
Part 4. 문서 생성 엔진 아키텍처             (4시간)  1,581줄 생성기 직접 구현
Part 5. MCP 서버로 확장                    (3시간)
Part 6. SaaS로 수익화                      (3시간)  인증/결제/팀 기능
```

#### 퍼널 예시

```
유튜브 (무료, 10만 뷰)
  ↓ 3%
Notion 템플릿 (₩19,000 × 3,000명) = ₩57,000,000
  ↓ 10%
유료 강의 (₩99,000 × 300명)       = ₩29,700,000
  ↓ 5%
AlignDev Pro 구독 (월 $19 × 15명) = 지속 수익
  ↓
기업 교육/컨설팅 (₩2,000,000 × 5건) = ₩10,000,000
```

---

### 모델 7: 기업 컨설팅 / 커스텀 구축

| 패키지 | 가격 | 내용 |
|---|---|---|
| 컨벤션 수립 워크샵 | ₩3,000,000 | 2일. 팀 인터뷰 → 표준 수립 → 문서화 |
| AI 에이전트 도입 컨설팅 | ₩8,000,000 | Claude Code/Cursor 팀 도입 + 규칙 세팅 + 교육 |
| 레거시 마이그레이션 | ₩15,000,000+ | 기존 코드 분석 → 표준화 → 점진 적용 |
| 온프레미스 AlignDev 구축 | ₩20,000,000+ | 사내 설치 + 커스텀 섹션 + 유지보수 |
| 커스텀 섹션 개발 | ₩2,000,000/섹션 | 회사 고유 규칙(보안/감사) 섹션화 |

**타깃**: 금융/보험(규제 준수 + 예산), 대기업 SI(다수 프로젝트 표준화), 시리즈 B+ 스타트업(급성장 기술부채), 공공기관(WCAG 법적 의무)

**영업 포인트**: "AI 에이전트 도입했는데 코드 품질이 더 나빠졌다" — 많은 회사의 현실.

---

### 모델 8: 스폰서십 / 어필리에이트

| 방식 | 수익 |
|---|---|
| GitHub Sponsors / Open Collective | 월 $50~500 |
| 툴 벤더 스폰서 (Vercel, Clerk, Supabase, Neon) | 월 $500~5,000 |
| 어필리에이트 (생성 문서 내 추천 링크) | 변동 |
| 뉴스레터 광고 (구독 10,000명) | 회당 $200~1,000 |

**주의**: 추천 스택이 돈 때문에 왜곡되면 신뢰가 붕괴한다. 반드시 "Sponsored" 라벨 명시.

---

### 모델 9: 영역 확장 (제품군화)

```
현재  AlignDev Frontend
확장  AlignDev Backend    — Node/NestJS/Spring/Laravel/Django/FastAPI
      AlignDev Mobile     — React Native / Flutter / Swift / Kotlin
      AlignDev DevOps     — Docker/K8s/Terraform/IaC
      AlignDev Data       — dbt/Airflow/스키마 네이밍/파이프라인
      AlignDev API        — REST/GraphQL 설계 + OpenAPI
      AlignDev Security   — 보안 코딩 표준 (OWASP)
      AlignDev QA         — 테스트 전략/커버리지 기준
```

**번들 가격**: 개별 각 $19/mo → 전체 "AlignDev Suite" $79/mo (약 50% 할인) → ARPU 4배

**전략적 의미**: "프론트엔드 컨벤션 도구"(니치) → "AI 에이전트 정렬 플랫폼"(카테고리 리더).
기업 입장에서 "하나만 도입하면 전사 표준화" = 구매 결정이 쉬워진다.

---

### 모델 10: 플랫폼화 (장기 비전)

```
AlignDev Platform — AI 에이전트 거버넌스 플랫폼

Standards Registry      조직의 모든 코딩 표준 중앙 관리
Agent Gateway           Claude/Cursor/Copilot이 표준을 자동 로드
Compliance Engine       실시간 준수율 + 추이 + 알림
Onboarding Automation   신입 개발자 자동 교육 (표준 기반 퀴즈)
Drift Detection         표준 vs 실제 코드 괴리 감지
Analytics               "어떤 규칙이 가장 많이 어겨지나?" → 규칙 개선 제안
```

**가격**: Business $199/mo, Enterprise $2,000~20,000/년 (좌석 기반)

**포지셔닝**: "린터는 문법을 검사한다. AlignDev는 우리 팀의 의도를 검사한다."
ESLint/Prettier가 대체 못 하는 영역 — 범용 규칙 vs 팀 고유 규칙.

---

## 8. 실행 로드맵

### Phase 0 — 즉시 (1주, 비용 0원)

```
□ LICENSE 파일 추가 (MIT)  ← 현재 없음
□ 배포 확인 + 도메인 연결
□ README에 데모 GIF 추가 (49테마 전환)
□ Product Hunt / Hacker News / Reddit r/webdev 등록
□ 트위터/링크드인 빌드인퍼블릭 시작
□ GitHub Sponsors 활성화
목표: 피드백 + Star 수집
```

### Phase 1 — 검증 (1개월, $0~50)

```
□ 유튜브 트랙 A 3편 제작
□ Notion 템플릿 ₩19,000 판매 시작
□ Analytics 설치 (어떤 스택을 많이 고르나?)
□ 이메일 수집 ("Pro 출시 알림 받기")
목표: 첫 수익 + 수요 검증
핵심 질문: "사람들이 돈 낼 기능은 무엇인가?"
```

### Phase 2 — SaaS 출시 (2~3개월, $50~100/mo)

```
□ GitHub OAuth + 저장 기능
□ Stripe (또는 포트원) 결제
□ Pro $19 / Team $49 출시
□ npx aligndev init CLI 공개
목표: MRR $500
```

### Phase 3 — 락인 (3~6개월)

```
□ GitHub App + 준수율 리포트  ← 최강 기능
□ MCP 서버 공개
□ Claude Code 플러그인 등록
□ 유료 강의 출시 (₩99,000)
목표: MRR $2,000 + 강의 수익
```

### Phase 4 — 확장 (6~12개월)

```
□ AlignDev Backend 출시
□ 템플릿 마켓플레이스 (커뮤니티)
□ Business 플랜 + 조직 대시보드
□ 기업 컨설팅 1~2건
목표: MRR $5,000+ / 연 매출 1억
```

### 우선순위 TOP 3

| 순위 | 항목 | 이유 |
|---|---|---|
| 1 | 유튜브 + Notion 템플릿 | 비용 0원, 리스크 0, 수요 검증 가능, SaaS 초기 고객 확보, 한국어 블루오션 |
| 2 | CLI + GitHub OAuth 저장 | 개발자는 CLI 선호 → 바이럴 엔진. 저장이 유료화 1호 기능 |
| 3 | 준수율 리포트 | 일회성 → 구독 전환의 유일한 열쇠. 해지 불가 락인. 기업 영업 무기. 모방 난이도 최고 |

### 전략 원칙

```
하지 말 것
  처음부터 전부 유료화 → 바이럴 소멸
  무료 기능 축소 → 신뢰 상실
  복잡한 가격 정책 → 이탈
  LLM API 붙이기 → 마진 100% 강점 포기

할 것
  생성은 영원히 무료 (이것이 마케팅)
  "저장 / 팀 / 추적"을 유료화
  오픈소스 유지 → 신뢰 + 컨트리뷰터
  빌드인퍼블릭 → 무료 마케팅
  커뮤니티 = 유일한 복제 방어선
```

### 포지셔닝 한 문장

> **"ESLint는 문법을 지키게 하고, AlignDev는 AI가 우리 팀처럼 코딩하게 한다."**

---

## 9. 발견된 개선 포인트

전수조사 중 발견한 실제 이슈들.

| 우선순위 | 항목 | 현황 | 권장 조치 |
|---|---|---|---|
| **높음** | `LICENSE` 파일 부재 | `README.md`가 `[MIT](LICENSE)`로 링크하지만 실제 파일이 없음 | MIT LICENSE 파일 추가 |
| 중간 | `package.json` `name` 불일치 | `"name": "frontend-ai-guide"` — 제품명 AlignDev와 불일치 | `aligndev`로 변경 검토 |
| 중간 | `engines` 필드 부재 | Node 버전 요구사항 미명시 (Next.js 16은 20.9+ 필요) | `"engines": { "node": ">=20.9" }` 추가 |
| 중간 | 테스트 스위트 없음 | `CLAUDE.md`에 명시. 생성기 2,500줄이 미검증 상태 | Vitest + 스냅샷 테스트 (선택값 조합별 출력 고정) |
| 낮음 | 빈 SVG 파일 | `public/next.svg`, `globe.svg`, `window.svg`, `vercel.svg`, `file.svg` 모두 0줄 | 미사용이면 삭제 |
| 낮음 | `typography-utils.ts` 정규식 오타 | `.replace(/\.not0+$/, '')` — `not`이 들어가 의도대로 동작하지 않음 (`sizeRem` 후행 0 제거 목적으로 보임) | `/\.?0+$/` 등으로 수정 검토 |
| 낮음 | `FALLBACK_VERSIONS`의 `scss: '0.2'` | `scss`는 npm 패키지로 사실상 사용되지 않음 (`sass`가 맞음). API `PACKAGES` 목록에도 없음 | `sass`로 교체 또는 제거 |
| 낮음 | `document-generator.ts` fallback 버전 노후 | `mv('next', '15')`, `mv('nuxt', '3')` 등 — `pkg-versions.ts`의 `FALLBACK_VERSIONS`(next 16, nuxt 4)와 불일치 | 2차 fallback 값 동기화 |
| 낮음 | `next.config.ts` 비어 있음 | 설정 없음 | 필요 시 `images`, `headers` 등 추가 |

---

## 참고 링크

- **저장소**: <https://github.com/bmshin94/aligndev>
- **분석 브랜치**: <https://github.com/bmshin94/aligndev/tree/claude/eloquent-pascal-76wgto>
- **배포 URL (기본값)**: <https://aligndev.dev>
- **테마 출처 스킬**: <https://github.com/nextlevelbuilder/ui-ux-pro-max-skill>

### 관련 기술 문서

- Next.js: <https://nextjs.org>
- React: <https://react.dev>
- Tailwind CSS v4: <https://tailwindcss.com>
- shadcn/ui: <https://ui.shadcn.com>
- Zustand: <https://zustand.docs.pmnd.rs>
- npm Registry API: <https://registry.npmjs.org>
- WCAG 2.2: <https://www.w3.org/TR/WCAG22/>

---

*이 문서는 `bmshin94/aligndev` 저장소 전체(58개 파일)를 코드 단위로 읽고 작성한 분석 결과입니다.*
