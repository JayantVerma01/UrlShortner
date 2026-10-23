# LinkLite — Mini URL Shortener

Paste a long URL, get a short link, open it, and get redirected (HTTP 302). Mappings are stored in MongoDB, so they survive server restarts.

Built for the WedigTech Full Stack Developer take-home assignment.

## Stack (and why)

| Piece | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript | One project for the UI and the API (Route Handlers), no separate server to run |
| Styling | Tailwind CSS v4 | Fast to build a clean, responsive UI |
| Database | MongoDB via Mongoose | A short-code → URL mapping is a simple document; the unique index gives collision safety |
| Tests | `node:test` (built into Node) | No extra test dependency |

Started from `create-next-app` (TypeScript, Tailwind, ESLint, App Router). Everything else was written for this project.

## Features

- Single-page UI: URL input, submit button, loading state, inline validation/API errors
- `POST /api/shorten` — validates the URL and stores it with a random 6-character code
- `GET /:code` — server-side **302** redirect to the original URL; **404** for unknown codes
- Persistent storage in MongoDB (collection is created automatically on first write)
- Copy-to-clipboard and "Open" actions on the result
- Optional feature (the one allowed): **last 5 shortened links**, kept in the browser's `localStorage`

## Project structure

```text
app/
  api/shorten/route.ts   POST /api/shorten
  [code]/route.ts        GET /:code  (302 redirect / 404)
  layout.tsx, page.tsx, globals.css
components/UrlShortener.tsx   client form + result + recent links
lib/mongodb.ts                cached Mongoose connection
lib/url.ts                    URL validation + secure code generation
models/Url.ts                 Mongoose schema (originalUrl, shortCode unique, createdAt)
tests/                        unit tests + API integration tests
```

## Prerequisites

- Node.js 20+ (developed on Node 24) and npm
- A reachable MongoDB: **either** a local instance **or** a MongoDB Atlas cluster. The app does not start its own database.

## Setup (about 5 minutes)

```bash
git clone <REPOSITORY_URL>
cd wedigtech-url-shortener
npm install
cp .env.example .env.local
```

Then make sure `MONGODB_URI` in `.env.local` points at a running MongoDB:

```env
# Local MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/wedigtech_url_shortener

# or Atlas (allow your IP in Atlas Network Access)
# MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/wedigtech_url_shortener?retryWrites=true&w=majority
```

Start it:

```bash
npm run dev
```

Open http://localhost:3000. No collections need to be created manually.

Production mode: `npm run build` then `npm start`.

## Environment variables

| Name | Required | Description |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string. Read only on the server; never sent to the browser. |

`.env.local` is git-ignored. Never commit real credentials.

## API

### `POST /api/shorten`

Request:

```json
{ "url": "https://example.com/blog/my-long-article" }
```

`201 Created`:

```json
{
  "success": true,
  "originalUrl": "https://example.com/blog/my-long-article",
  "shortCode": "aB12xY",
  "shortUrl": "http://localhost:3000/aB12xY"
}
```

Errors return `{ "success": false, "error": "<message>" }`:

| Status | When |
|---|---|
| 400 | invalid JSON, missing/non-string/empty `url`, not a valid URL, protocol other than http/https, longer than 2048 chars |
| 500 | MongoDB unavailable or write failed (details are logged server-side only, never returned) |

### `GET /:code`

- `302` with `Location: <original URL>` when the code exists
- `404` `{ "success": false, "error": "Short link not found." }` otherwise
- `500` if the database is unreachable

```bash
curl -i -X POST http://localhost:3000/api/shorten -H "Content-Type: application/json" -d '{"url":"https://example.com"}'
curl -i http://localhost:3000/<shortCode>
```

## How it works

- **Codes:** 6 characters from `A-Za-z0-9` (62^6 ≈ 5.7×10^10), generated with `crypto.randomInt` (uniform, no modulo bias).
- **Collisions:** `shortCode` has a unique index. The API inserts directly and, on a duplicate-key error (code 11000), retries with a new code (max 5 attempts, then a 500). There is no check-then-insert race.
- **Connection:** `lib/mongodb.ts` caches the connection promise on `globalThis` so dev hot reloads don't open new connections, and clears it on failure so the next request retries.
- **302, not 301:** a 302 is temporary, so browsers don't cache the mapping permanently.

## Testing

```bash
npm test          # unit tests (validation, code generation) - no server needed
npm run lint
npm run build
```

API integration tests need the app running and MongoDB reachable:

```bash
npm run dev            # in one terminal
npm run test:api       # in another (BASE_URL defaults to http://localhost:3000)
```

### What was verified (run during development)

Against a real `mongod` 8.2.6 on 127.0.0.1:27017 (see Known issues about how it was provided):

- `npm test`: 9/9 pass. `npm run test:api`: 4/4 pass. `npm run lint` and `tsc --noEmit`: clean. `npm run build`: succeeds.
- curl: valid URL → 201; empty, whitespace, `hello`, `javascript:alert(1)`, `ftp://…`, `{}`, non-JSON body, non-string url, >2048 chars → 400; unknown code → 404; known code → `302` with the exact `Location` (query string and fragment preserved).
- Document and unique `shortCode_1` index confirmed directly in MongoDB.
- Restarted the Next.js server: the old short code still returned 302.
- MongoDB stopped: both endpoints returned a generic 500; after MongoDB came back the same code worked again without restarting Next.
- Browser (in-app pane): validation error shown for `hello`; valid URL produced the result card and "Recent links"; mobile (375px) layout looks fine.

**Not verified:** the Copy button's "Copied!" feedback (the in-app browser blocked/didn't confirm clipboard access, so please click it once in a normal browser); the forced duplicate-code retry path (only the duplicate-key detection is unit-tested, the loop itself was not exercised with a real collision); MongoDB Atlas (not tried).

## What's working

All must-have features, plus the "last 5 links" optional feature.

## Known issues and limitations

- Requires a reachable MongoDB; there is no in-memory fallback.
- The same long URL submitted twice produces two different short codes (no de-duplication).
- No rate limiting or abuse protection; any http(s) URL is accepted (including ones pointing to private hosts).
- `shortUrl` is built from the request's origin, so behind a reverse proxy the proxy must forward the correct `Host`/protocol.
- "Recent links" lives in one browser's `localStorage`; it is not shared across devices.
- During development no local MongoDB or running Docker daemon was available, so the verification above used a standalone `mongod` binary downloaded via `mongodb-memory-server` (kept outside this repo; not a dependency).

## AI usage

Built with Claude (Claude Code). See [AI_LOG.md](AI_LOG.md) for the actual interactions, what was generated, and what was verified.

## What I'd do next with another 4 hours

- More automated tests: a hermetic API test suite with a throwaway database, including a forced short-code collision to exercise the retry loop.
- Custom short aliases (with reserved-word and format checks).
- Click analytics (counter and last-visited per link).
- Rate limiting and abuse prevention (per-IP limits, URL blocklist, blocking private/loopback targets).
- Deploy (Vercel + MongoDB Atlas) with a configurable `BASE_URL`.
- De-duplicate identical URLs and add link expiry.
