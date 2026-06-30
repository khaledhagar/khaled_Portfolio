# Project Updates & Plan

_Last updated: 2026-06-30_

This document captures (A) a full project review, (B) the diagnosis and fix for the
"page fails to load" problem, and the two follow-up steps: (C) enriching the app
with the real CV, and (D) hosting on Netlify.

### Progress at a glance

| Section | Task | Status |
|---------|------|--------|
| A | Project review | ✅ Done |
| B | "Page fails to load" fix | ✅ Done & verified — 2026-06-29 |
| C | Enrich app with real CV | ✅ Done & verified — 2026-06-30 |
| D | Host on Netlify | ⬜ Not started (needs `git init` + Netlify account) |
| E | Pre-hosting testing | ✅ Done — 2026-06-29, re-verified 2026-06-30 |

---

## A. Project Review

**What it is:** A personal portfolio site for Khaled Hagar, built with **Next.js 15
(App Router) + React 19 + Tailwind CSS v4 + TypeScript**, with an AI "career chat"
backed by **OpenRouter**.

**Structure**

| Area | Files | Notes |
|------|-------|-------|
| App shell | `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` | Fonts (Syne + DM Sans), metadata, section composition |
| Sections | `src/components/{Hero,About,Journey,Career,Skills,Portfolio,Contact,Footer,Header}.tsx` | Presentational, all driven by one data file |
| AI chat | `src/components/CareerChat.tsx`, `src/app/api/chat/route.ts`, `src/lib/{openrouter,career-context,rate-limit}.ts` | Serverless chat endpoint, rate-limited |
| **Single source of truth** | `src/data/profile.ts` | Powers *both* the visual sections *and* the AI system prompt (`career-context.ts`) |
| Infra | `next.config.ts`, `netlify.toml`, `scripts/setup-local-cache.ps1`, `scripts/clean.mjs` | Security headers, OneDrive cache workaround |

**Key architectural insight:** `src/data/profile.ts` is the one place that feeds
every section component **and** the AI chat's knowledge (`buildCareerSystemPrompt()`
in `career-context.ts`). Enriching the CV data therefore upgrades the whole site —
visuals and chatbot — in one edit.

**Health notes**
- Security headers + CSP are already configured in `next.config.ts` (good).
- The OpenRouter key is read server-side only (`getOpenRouterApiKey`) — not exposed
  to the client. Good.
- `node_modules` and `.next` are relocated **out of OneDrive** via Windows junctions
  to avoid sync corruption (see `scripts/setup-local-cache.ps1`).

---

## B. "Page fails to load" — ✅ FIXED & VERIFIED

> **Status: RESOLVED on 2026-06-29.** Root cause found, fixed automatically (no
> elevation needed in the end), hardened against recurrence, and verified with a
> full production build + live HTTP 200. Details below.

### Root cause (confirmed by reproduction)

The dev server starts and compiles, then crashes on first request with:

```
Error: Cannot find module 'next/dist/compiled/next-server/app-page.runtime.dev.js'
Require stack:
- C:\Users\khale\AppData\Local\next-cache\Site\.next\server\app\page.js   ← .next is on C:
- D:\next-cache\Site\node_modules\next\dist\server\require.js             ← node_modules is on D:
```

The two cache junctions were pointing at **different drives**:

| Junction | Was pointing to | Drive |
|----------|-----------------|-------|
| `node_modules` | `D:\next-cache\Site\node_modules` | **D:** (same as project ✅) |
| `.next` | `C:\Users\khale\AppData\Local\next-cache\Site\.next` | **C:** (different ❌) |

Because the project lives on **D:**, webpack emits **relative** module specifiers
(e.g. `(ssr)/../../../../../next-cache/Site/node_modules/next/...`). A relative path
**cannot cross drive letters on Windows**, so the compiled `.next` output on C: can
never resolve `next/dist/...` back on D:. The result is the recurring
"page fails to load."

This is the *exact* failure the project's own `scripts/setup-local-cache.ps1` warns
about in its header comment:

> "the cache MUST be on the same drive as the project. A junction to another drive
> makes webpack/Next emit broken cross-drive `./C:/...` paths."

### The fix

Re-point the `.next` junction to the **same drive as the project (D:)**, matching
`node_modules`:

```
.next  ->  D:\next-cache\Site\.next
```

### What was done (applied automatically)

Removing the bad junction was initially blocked: the `.next` junction carried a
OneDrive **PINNED** attribute (`0x80000`) and OneDrive locked the reparse point —
`attrib`/`rmdir`/`Directory.Delete` all returned *Access is denied*. The workaround
that succeeded **without elevation** was a low-level reparse-point delete:

```
fsutil reparsepoint delete ".next"   # clears the locked reparse point
attrib -r -s -h -p ".next"            # strip leftover readonly/pinned bits
[IO.Directory]::Delete(".next")       # remove the now-plain empty dir
New-Item -ItemType Junction -Path ".next" -Target "D:\next-cache\Site\.next"
```

Result — both junctions now resolve to the **same drive** as the project:

| Junction | Now points to |
|----------|---------------|
| `node_modules` | `D:\next-cache\Site\node_modules` ✅ |
| `.next` | `D:\next-cache\Site\.next` ✅ |

### Durability — so it never recurs (the "load dynamically without future issues" ask)

Three hardening changes were made:

1. **`scripts/setup-local-cache.ps1` now self-heals.** Previously it returned early
   if `.next` was *already* a junction — even one pointing at the wrong drive — which
   is why the bad state persisted. It now **validates the junction target** and, if
   wrong, repairs it using the `fsutil reparsepoint delete` technique above. Running
   `npm run setup:cache` will now fix a drifted junction automatically.
2. **`tsconfig.json` exclude hardened.** Added `*.onedrive-old`, `**/node_modules`,
   `.next`, `next-cache` so stray/backup folders can never break the type-check
   again (this had broken the first build attempt).
3. **Removed stale backups** `node_modules.onedrive-old/` and `.next.onedrive-old/`
   (leftovers from the original cache migration; the setup script always intended for
   these to be deleted).

**Optional, most bulletproof:** move the project (or exclude its folder) out of
OneDrive entirely, so OneDrive can never re-pin the junctions. Not required — the
self-healing script now recovers automatically if it ever happens again.

### Verification (see Section E for full results)

Production build passes, and `next start` serves the homepage at **HTTP 200** with
the full page content and security headers intact.

---

## C. Step 1 — Enrich the app with the real CV — ✅ COMPLETED & VERIFIED

> **Status: DONE on 2026-06-30.** `src/data/profile.ts` was fully rewritten with the
> real CV, `career-context.ts` and all affected components were updated to consume the
> new fields, and a clean production build confirms everything renders. Build re-run
> 2026-06-30: ✅ compiled successfully, 4 routes, no lint/type errors.

### What was completed (verified against the live files)

| Item | Plan | Status |
|------|------|--------|
| Rewrite `profile.ts` | Full 6-role timeline, real skills/certs, new keys | ✅ `experience` now has 5 roles (Tank Farm → DCS → Shift Sup → ASORC secondment → AGM); added `techSkills`, `projects`, `conferences`, `affiliations`, `languages`, `professionalSummary` |
| Title | "AGM — Refinery Operations" | ✅ Set |
| Skills | Domain depth | ✅ 8 weighted skills (Operations, Commissioning, PSM, DCS/APC, Turnaround, HAZOP, HYSYS…) |
| Certifications | NEBOSH PSM, IChemE PSM, Lean Six Sigma, ABB 800xA, HYSYS, TOT | ✅ All 6 present |
| Education | + Diploma in Programming Engineering, Cairo | ✅ Added (Master's + B.Sc. + Diploma) |
| Projects | Real projects, `comingSoon: false` | ✅ 6 real projects; `portfolio.comingSoon = false` |
| Conferences | EGYPS 2024, IGSR, poster | ✅ 3 entries |
| Tech skills | C++, C#, SQL, Git, HTML/CSS + DCS tools | ✅ Present |
| Affiliations | PSM / ISO / HAZOP committees | ✅ 3 entries |
| `career-context.ts` | Extend system prompt with new fields | ✅ Includes experience, projects, conferences, techSkills, affiliations, languages |
| `Career.tsx` | Multi-role timeline + education | ✅ Renders all roles + education cards |
| `Portfolio.tsx` | Real projects + speaking block | ✅ Renders `projects` grid + `conferences` |
| `Skills.tsx` | Skills + certs + tech toolkit + affiliations | ✅ All rendered (incl. tech toolkit & affiliations blocks) |
| `About.tsx` | Refinery + PSM story, education | ✅ Updated copy + education list |
| Contact / phone | Decision: keep email + LinkedIn only | ✅ Phone NOT published (email + LinkedIn only) |

---

### Original plan & source (for reference)

**Source:** `Khaled Elsaid Hagar_Cv.pdf` (the detailed CV). The older
`Profile.pdf` is a sparse LinkedIn export and is now superseded.

**Approach:** All enrichment flows through a single edit to `src/data/profile.ts`,
which automatically updates every section component **and** the AI career-chat
knowledge base. Minor component tweaks are only needed where new data *types* are
introduced (projects, conferences, multi-role timeline).

### What the CV adds (currently missing from `profile.ts`)

| Area | Current `profile.ts` | Enriched from CV |
|------|----------------------|------------------|
| Title | "Assistant General Manager" | ✅ Confirmed: "Assistant General Manager — Refinery Operations" |
| Experience | 1 generic role | **6-role progression**: Tank Farm Shift Supervisor (2008–10) → DCS Panel Operator (2010–16) → Shift Supervisor (2016–20) → Shift Supervisor / ASORC secondment-commissioning (Dec 2020–Sep 2021) → AGM (Present) |
| Skills | 5 generic | Add domain depth: Commissioning & Start-up, Turnaround Planning, Process Safety Management (PSM), HAZOP, DCS/APC (ABB 800xA, Foxboro, Honeywell, Symphony), Aspen HYSYS, Emergency Response |
| Certifications | 1 ("C# in progress") | **NEBOSH PSM**, PSM Foundation (IChemE/ENNPI), Lean Six Sigma Green Belt, ABB Germany 800xA Expert Workshop, Aspen HYSYS, TOT Certified Facilitator, + training list |
| Education | Master's + Bachelor's | Add **Diploma in Programming Engineering, Cairo University** (reinforces the software narrative) |
| Projects | "coming soon" placeholder | **Real projects:** ASORC greenfield naphtha start-up lead; ABB 800xA DCS migration (FAT); DRCS/TRICOM SIS upgrade; HYSYS simulation suite; Methanator unit commissioning; turnaround leadership |
| Conferences | — (none) | **EGYPS 2024 speaker**, IGSR Climate Change Conference speaker, poster presenter |
| Tech skills | — | C++, C#, SQL, Git/GitHub, HTML, CSS (bridges petroleum → software story) |
| Affiliations | — | PSM Committee, ISO Standards Committee, HAZOP team |
| Contact | email, LinkedIn | Add phone (+20 122 997 1737) and location (Alexandria) — *optional, your call on exposing phone publicly* |

### Concrete plan

1. **Rewrite `src/data/profile.ts`** — expand `experience` into the full 6-role
   timeline, replace `skills`/`certifications`, add new keys: `projects`,
   `conferences`, `techSkills`, `affiliations`. Update `journey` to reflect the real
   operator→manager arc and the EGYPS 2024 / start-up milestones. Flip
   `portfolio.comingSoon` to `false` and populate it from `projects`.
2. **Update `career-context.ts`** — extend `buildCareerSystemPrompt()` to include the
   new fields so the AI chat can answer about projects, certifications, conferences,
   and the programming background.
3. **Component updates** —
   - `Career.tsx` / `Journey.tsx`: render the multi-role timeline.
   - `Portfolio.tsx`: render real `projects` instead of the "coming soon" card.
   - `Skills.tsx`: optionally split into "Operations" vs "Software/Tools" groups.
   - Add a small **Conferences / Speaking** block (new component or within About).
4. **Re-tune the Hero/About copy** to lead with the refinery-operations + process-
   safety story and the operator→AGM progression.
5. **Decision needed from you:** publish phone number publicly? (Recommend: no — keep
   email + LinkedIn only.)

> Estimated scope: ~1 substantial data edit + ~3–4 component edits. Low risk; no new
> dependencies.

---

## D. Step 2 — Host on Netlify

Good news: `netlify.toml` is **already configured** correctly (build = `npm run build`,
Node 22, `@netlify/plugin-nextjs`). Remaining work is repo + deploy setup.

### Prerequisites
- The project is **not yet a git repository** (`git init` needed).
- `.gitignore` already excludes `node_modules`, `.next`, `.env*` (good — secrets stay out).
- Confirm `@netlify/plugin-nextjs` is installed (it's referenced in `netlify.toml`;
  Netlify auto-installs it during build, so a local install is optional).

### Plan

1. **Initialize git & first commit**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: portfolio site"
   ```
2. **Create a GitHub repo & push** (private or public):
   ```bash
   gh repo create khaled-hagar-site --source=. --private --push
   ```
3. **Connect to Netlify** — either:
   - **Dashboard:** app.netlify.com → "Add new site" → "Import from Git" → pick the repo.
     Netlify reads `netlify.toml` automatically.
   - **CLI:** `npm i -g netlify-cli && netlify init && netlify deploy --build --prod`
4. **Set environment variables** in Netlify (Site settings → Environment variables) —
   these are NOT in git:
   - `OPENROUTER_API_KEY` = your OpenRouter key (required for the chat to work)
   - `NEXT_PUBLIC_SITE_URL` = the production URL (e.g. `https://<your-site>.netlify.app`
     or custom domain)
5. **Update CSP if needed** — `connect-src` already allows `https://openrouter.ai`.
   If you add a custom domain, no CSP change is required (it's same-origin).
6. **Deploy & verify** — confirm the homepage renders and the career chat returns a
   reply (tests the serverless `/api/chat` function + the env key).
7. **Optional:** add a custom domain + HTTPS (Netlify provisions Let's Encrypt certs
   automatically).

### Notes / gotchas
- The OneDrive cache junctions (`scripts/setup-local-cache.ps1`) are a **local dev**
  concern only — they have no effect on Netlify builds (fresh `node_modules`, fresh
  `.next` in the build container).
- Make sure the OpenRouter key/model you reference (`openai/gpt-oss-120b`) is
  available on your OpenRouter account, or the chat will fall back / error in prod.

---

## E. Pre-hosting testing — Results (2026-06-29)

All run after the fix + hardening:

| Test | Command | Result |
|------|---------|--------|
| Lint | `npm run lint` | ✅ No ESLint warnings or errors |
| Type-check + production build | `npm run build` | ✅ Compiled successfully; 4 routes generated |
| Route output | — | ✅ `/` static (106 kB First Load JS), `/api/chat` serverless function |
| Production server | `npx next start` | ✅ Ready in 2.4s |
| Homepage HTTP | `GET http://localhost:3000` | ✅ **HTTP 200**, 87 KB HTML |
| Content render | — | ✅ Contains name + hero/operations copy |
| Security headers | — | ✅ `X-Frame-Options: DENY`, CSP present |
| Cache junctions | — | ✅ both `.next` and `node_modules` on `D:` |

> Note: `next lint` prints a deprecation notice (removed in Next.js 16). Non-blocking,
> but a future migration to the ESLint CLM (`npx @next/codemod next-lint-to-eslint-cli .`)
> is advisable.

**The app is build-clean and hosting-ready.** Remaining for production: set
`OPENROUTER_API_KEY` in Netlify so the chat works live (build does not need it; the
key is only read at request time).

---

## Suggested order of execution

1. ~~**Fix the page load** (Section B)~~ — ✅ Done & verified 2026-06-29.
2. ~~**Enrich with CV** (Section C)~~ — ✅ Done & verified 2026-06-30 (clean build).
3. **Deploy to Netlify** (Section D) — ⬜ **Remaining.** The site is verified locally
   and build-clean. Next concrete steps: `git init` → first commit → push to GitHub →
   connect on Netlify → set `OPENROUTER_API_KEY` env var → deploy & verify the chat.
   Requires your GitHub/Netlify accounts; ready to do on your go-ahead.
