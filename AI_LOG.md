# AI Log

**Tool:** Claude (Claude Code). I defined the architecture and requirements; Claude wrote the code to that spec.

## Entry 1 — Design and spec (my decisions)

**Tool:** Claude

**Asked:** I gave Claude a detailed spec: Next.js App Router + TypeScript + Tailwind, MongoDB with Mongoose only (no other DB), no extra server or unnecessary libraries, a defined folder structure (`lib/`, `models/`, `components/`, route handlers), the schema (`originalUrl`, unique `shortCode`, `createdAt`), the API contract and status codes (201/400/500, 302, 404), `crypto`-based 6-character codes, uniqueness enforced by the database with bounded retries, and the "last 5 links" optional feature.

**Got:** An implementation of that structure.

**What I did:** Chose the stack and architecture, and set the constraints .

**Result:** The project followed my design.

## Entry 2 — Scaffold and backend

**Tool:** Claude

**Asked:** Scaffold the app and implement the model, cached connection, validation, `POST /api/shorten` and `GET /:code`.

**Got:** Working code, but with a bug: Claude exported `runtime`/`dynamic` from the route files, which this Next.js version (with `cacheComponents`) rejects, giving HTTP 500. Claude also found the generated `.gitignore` would have ignored `.env.example`.

**What I did:** Claude fixed both after spotting them in the dev log and git status.

**Result:** POST returns 201, redirect returns 302 with the correct `Location`, unknown code returns 404.

## Entry 3 — Verification

**Tool:** Claude

**Asked:** Test the edge cases from my requirements table and confirm persistence.

**Got:** curl checks (empty, whitespace, `hello`, `javascript:`, `ftp:`, bad JSON, too-long URL → 400), 9 unit tests, 4 API tests, a lint/typecheck/production build, a server restart check, and a MongoDB-down check (graceful 500, recovers when it returns). No local MongoDB was installed, so Claude ran a standalone `mongod` binary for testing.

**What I did:** Required these edge cases and checks in my spec (invalid input, 404, 302, restart persistence, MongoDB down, production build).

**Result:** All of these passed. Not tested: forced short-code collision, MongoDB Atlas, and the Copy button's "Copied" feedback.

## Entry 4 — Frontend and UI redesign

**Tool:** Claude

**Asked:** Build the form with loading/error states, copy/open, and the last-5 list; later, I asked for a more modern, impressive UI.

**Got:** A responsive component, then a dark gradient redesign. Only styling changed in the redesign.

**What I did:** Directed the look and feel and requested the redesign.

**Result:** Checked at desktop and 375px mobile in the in-app browser.
