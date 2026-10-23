# AI Log

Tool used throughout: Claude (Claude Code, in the desktop app). Entries below describe what actually happened in the development session. Lines marked **PENDING** are things only Jayant can confirm; they have not been filled in on his behalf.

## Entry 1

**Tool:** Claude

**Asked:** Jayant supplied the WedigTech assignment PDF plus a long implementation prompt: build the Mini URL Shortener with Next.js App Router, TypeScript, Tailwind, MongoDB + Mongoose only, POST `/api/shorten`, 302 redirect on `/:code`, README, honest AI_LOG, sensible commits, and "begin actual implementation now".

**Got:** Claude read the PDF (the built-in PDF reader failed because `pdftoppm` is missing, so it extracted the text with `pypdf` instead), checked the workspace (empty), and checked tooling: Node 24, git present, **no `mongod`, Docker installed but its daemon not running**.

**What I did:** PENDING — Jayant to describe his own review/decisions (e.g. choosing MongoDB, the prompt itself).

**Result:** Plan and environment constraints established before writing code.

## Entry 2

**Tool:** Claude

**Asked:** Scaffold the project (part of the same instruction as Entry 1).

**Got:** `create-next-app` refused the folder name `UrlShortner` (npm disallows capital letters), so Claude scaffolded as `wedigtech-url-shortener` in a scratch directory and copied it into the workspace. This produced Next.js 16 with `cacheComponents` enabled in `next.config.ts` and an `AGENTS.md` warning that this Next version has breaking changes. Claude also found the generated `.gitignore` had `.env*`, which would have ignored `.env.example`, and replaced it with explicit `.env`, `.env.local`, `.env.*.local` entries.

**What I did:** PENDING — Jayant to confirm whether he reviewed the scaffold/gitignore change.

**Result:** First commit `chore: initialize Next.js project`.

## Entry 3

**Tool:** Claude

**Asked:** Implement the Mongoose model, cached connection helper, URL validation, secure code generation, `POST /api/shorten` and `GET /[code]`.

**Got:** `lib/mongodb.ts` (promise cached on `globalThis`, cleared on failure), `models/Url.ts` (unique index on `shortCode`), `lib/url.ts` (`URL` constructor validation, http/https only, 2048-char cap, `crypto.randomInt` codes, duplicate-key detection), and both route handlers with a bounded retry loop on duplicate-key errors. **Bug in Claude's first version:** it exported `runtime = "nodejs"` and `dynamic = "force-dynamic"` from both routes; with this project's `cacheComponents: true` Next returned HTTP 500 ("Route segment config "runtime" is not compatible with nextConfig.cacheComponents"). Claude found this in the dev server log on the first curl and removed both exports (Node is the default runtime).

**What I did:** PENDING — Jayant to add his own review notes.

**Result:** After the fix, POST and GET worked. Commits `feat: implement MongoDB URL storage` and `feat: add URL shortening API and 302 redirect route`. (Claude also accidentally committed a `dev.log` in the first of these; it was removed in a later commit and `*.log` is now git-ignored.)

## Entry 4

**Tool:** Claude

**Asked:** Get a MongoDB running so the backend could really be tested (none was installed, Docker daemon off).

**Got:** Claude installed `mongodb-memory-server` in a scratch folder outside the repo. Starting it through its API timed out (10 s), but its downloaded `mongod` 8.2.6 binary started fine when launched directly with a persistent `--dbpath`.

**What I did:** PENDING — Jayant to note whether he tested with his own local MongoDB/Atlas.

**Result:** Real mongod on 127.0.0.1:27017; used for all verification in the README.

## Entry 5

**Tool:** Claude

**Asked:** Test the backend per the assignment's edge-case table.

**Got:** Claude ran curl against the dev server: 201 for a valid URL with query and fragment; 400 for empty, whitespace, `hello`, `javascript:alert(1)`, `ftp://…`, `{}`, invalid JSON, numeric url, 2,100-char URL; 404 for unknown code; 302 with exact `Location`. It also queried MongoDB directly to confirm the stored document and the unique `shortCode_1` index.

**What I did:** PENDING.

**Result:** All of those returned the expected status codes.

## Entry 6

**Tool:** Claude

**Asked:** Build the frontend (form, loading/error states, result card, copy/open, last-5 recent links in `localStorage`).

**Got:** `components/UrlShortener.tsx` and `app/page.tsx`; light theme, Tailwind. Claude removed the template's dark-mode CSS and Arial font override. Typecheck and ESLint were clean.

**What I did:** PENDING — Jayant to note any UI changes he makes or reviews.

**Result:** Commit `feat: build responsive frontend with recent links list`.

## Entry 7

**Tool:** Claude

**Asked:** Write automated tests, run the production build, and test restart persistence and MongoDB-down behavior.

**Got:** `tests/url.test.ts` (9 unit tests) and `tests/api.test.ts` (4 integration tests), `allowImportingTsExtensions` added to `tsconfig.json` so Node can run the `.ts` tests directly. Claude ran lint, `tsc`, `npm test`, `npm run build`, `npm start` + `npm run test:api`; then stopped and restarted the Next server and re-requested an earlier code; then killed `mongod`, saw generic 500s, restarted `mongod`, and saw the same code redirect again.

**What I did:** PENDING.

**Result:** All of the above passed. Not exercised: a forced real short-code collision (retry loop), Atlas.

## Entry 8

**Tool:** Claude

**Asked:** Check the UI in the in-app browser (desktop and 375px mobile).

**Got:** Confirmed the validation error for `hello`, the result card, the recent-links list, and a sensible mobile layout. Claude's attempts to confirm the Copy button's "Copied!" state were inconclusive (one attempt used a script click without a user gesture, which the browser rejects).

**What I did:** PENDING — Jayant should click Copy manually in a normal browser and record the outcome here.

**Result:** Copy feedback is listed as NOT VERIFIED in the README.
