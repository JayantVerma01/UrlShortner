# Submission materials (drafts)

## 60-second Loom script

Record this yourself; nothing has been recorded yet.

- **0–10s** — "This is LinkLite, a mini URL shortener built with Next.js, TypeScript, Tailwind, and MongoDB with Mongoose. One Next.js app serves both the UI and the API."
- **10–25s** — Paste a long URL with a query string, click Shorten, show the short link. Click Copy.
- **25–40s** — Open the short link in a new tab; show the redirect landing on the original URL. (Optional: `curl -i` the short link to show `302` and the `Location` header.)
- **40–50s** — Type `hello` and submit to show the validation error; mention empty input, non-http(s) protocols, and 404 for unknown codes.
- **50–60s** — "Links are stored in MongoDB, so they survive restarts. The unique index plus retry handles code collisions." Show the README (with "What I'd do next") and AI_LOG.md. Mention the recent-links list (last 5, localStorage).

## Email draft (do not send until the links are real)

**To:** ankish@wedigtech.com
**Subject:** FSD Assignment — [Your Name]

Hi Ankish,

Please find my submission for the Full Stack Developer take-home assignment.

- **Project:** LinkLite — Mini URL Shortener
- **GitHub repository:** [REPOSITORY_URL]
- **Stack:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS, Next.js Route Handlers, MongoDB with Mongoose
- **Main features:** POST /api/shorten with validation; unique 6-character codes (unique index + retry on collision); HTTP 302 redirect from /:code with 404 for unknown codes; persistent MongoDB storage; responsive UI with copy/open; last 5 links via localStorage (my one optional feature)
- **Demo recording:** [LOOM_OR_RECORDING_URL]
- **Docs:** setup instructions, API docs, known issues and "What I'd do next with another 4 hours" are in README.md; my honest AI usage log is in AI_LOG.md

MongoDB (local or Atlas) needs to be reachable; the README explains the `MONGODB_URI` setup.

Thank you for your time.

Best regards,
[Your Name]

## Publishing to GitHub (when you decide to)

```bash
git remote add origin <REPOSITORY_URL>
git push -u origin main
```

Make the repo public, or add ankish@wedigtech.com as a collaborator if private.
