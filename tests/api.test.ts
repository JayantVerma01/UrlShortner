// Integration tests: need the app running (npm run dev) and MongoDB reachable.
// Run with: npm run test:api   (BASE_URL defaults to http://localhost:3000)
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

function shorten(body: string) {
  return fetch(`${BASE}/api/shorten`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("POST /api/shorten", () => {
  it("creates a short link (201) preserving query and fragment", async () => {
    const url = "https://example.com/blog/post?a=1&b=2#top";
    const res = await shorten(JSON.stringify({ url }));
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.originalUrl, url);
    assert.match(data.shortCode, /^[A-Za-z0-9]{6}$/);
    assert.ok(data.shortUrl.endsWith(`/${data.shortCode}`));
  });

  it("returns 400 for bad input", async () => {
    for (const body of [
      JSON.stringify({ url: "" }),
      JSON.stringify({ url: "   " }),
      JSON.stringify({ url: "hello" }),
      JSON.stringify({ url: "javascript:alert(1)" }),
      JSON.stringify({ url: "ftp://example.com" }),
      JSON.stringify({}),
      JSON.stringify({ url: "https://e.com/" + "a".repeat(3000) }),
      "{not json",
    ]) {
      const res = await shorten(body);
      assert.equal(res.status, 400, body.slice(0, 40));
      assert.equal((await res.json()).success, false);
    }
  });
});

describe("GET /:code", () => {
  it("redirects with 302 and the original Location", async () => {
    const url = "https://example.com/redirect-test?x=1#frag";
    const { shortCode } = await (await shorten(JSON.stringify({ url }))).json();
    const res = await fetch(`${BASE}/${shortCode}`, { redirect: "manual" });
    assert.equal(res.status, 302);
    assert.equal(res.headers.get("location"), url);
  });

  it("returns 404 for an unknown code", async () => {
    const res = await fetch(`${BASE}/zzzzzz`, { redirect: "manual" });
    assert.equal(res.status, 404);
  });
});
