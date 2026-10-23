import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_URL_LENGTH, generateShortCode, isDuplicateKeyError, validateUrl } from "../lib/url.ts";

describe("validateUrl", () => {
  it("rejects non-strings, empty and whitespace-only input", () => {
    for (const v of [undefined, null, 123, {}, "", "   "]) {
      assert.equal(validateUrl(v).ok, false, String(v));
    }
  });

  it("rejects strings that are not URLs", () => {
    assert.equal(validateUrl("hello").ok, false);
  });

  it("rejects non-http(s) protocols", () => {
    assert.equal(validateUrl("javascript:alert(1)").ok, false);
    assert.equal(validateUrl("ftp://example.com").ok, false);
  });

  it("rejects URLs over the length limit", () => {
    const long = "https://example.com/" + "a".repeat(MAX_URL_LENGTH);
    assert.equal(validateUrl(long).ok, false);
  });

  it("accepts http and https and trims whitespace", () => {
    assert.deepEqual(validateUrl("  http://example.com "), { ok: true, url: "http://example.com" });
    assert.equal(validateUrl("https://example.com").ok, true);
  });

  it("preserves query string and fragment", () => {
    const u = "https://example.com/a?x=1&y=2#section";
    assert.deepEqual(validateUrl(u), { ok: true, url: u });
  });
});

describe("generateShortCode", () => {
  it("returns 6 alphanumeric characters", () => {
    for (let i = 0; i < 200; i++) assert.match(generateShortCode(), /^[A-Za-z0-9]{6}$/);
  });

  it("does not repeat across a sample", () => {
    const codes = new Set(Array.from({ length: 1000 }, () => generateShortCode()));
    assert.ok(codes.size > 990);
  });
});

describe("isDuplicateKeyError", () => {
  it("detects Mongo error code 11000 only", () => {
    assert.equal(isDuplicateKeyError({ code: 11000 }), true);
    assert.equal(isDuplicateKeyError({ code: 1 }), false);
    assert.equal(isDuplicateKeyError(null), false);
    assert.equal(isDuplicateKeyError(new Error("x")), false);
  });
});
