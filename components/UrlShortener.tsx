"use client";

import { useEffect, useState, type FormEvent } from "react";

type ShortLink = { originalUrl: string; shortUrl: string };

const STORAGE_KEY = "linklite:recent";
const MAX_RECENT = 5;

function loadRecent(): ShortLink[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is ShortLink =>
          typeof l?.originalUrl === "string" && typeof l?.shortUrl === "string",
      )
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function saveRecent(links: ShortLink[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch {
    // localStorage unavailable (private mode, quota): the list just won't persist.
  }
}

export default function UrlShortener() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShortLink | null>(null);
  const [recent, setRecent] = useState<ShortLink[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // localStorage only exists in the browser, so it is read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecent(loadRecent());
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!url.trim()) {
      setError("Please enter a URL.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }
      const link: ShortLink = { originalUrl: data.originalUrl, shortUrl: data.shortUrl };
      setResult(link);
      const next = [link, ...recent.filter((l) => l.shortUrl !== link.shortUrl)].slice(0, MAX_RECENT);
      setRecent(next);
      saveRecent(next);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied((c) => (c === text ? null : c)), 2000);
    } catch {
      setError("Couldn't copy automatically. Please select and copy the link.");
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="url" className="sr-only">
          Long URL
        </label>
        <div
          className={`flex flex-col gap-2 rounded-2xl border bg-white/[0.04] p-2 shadow-2xl shadow-violet-950/40 backdrop-blur transition focus-within:border-violet-400/60 focus-within:ring-4 focus-within:ring-violet-500/15 sm:flex-row ${
            error ? "border-red-400/50" : "border-white/10"
          }`}
        >
          <input
            id="url"
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder="https://example.com/your/very/long/link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "url-error" : undefined}
            className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-base text-white outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading && (
              <span
                aria-hidden
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              />
            )}
            {loading ? "Shortening…" : "Shorten"}
          </button>
        </div>
        {error && (
          <p id="url-error" role="alert" className="animate-rise mt-3 flex items-center gap-2 text-sm text-red-300">
            <span aria-hidden>⚠</span> {error}
          </p>
        )}
      </form>

      {result && (
        <section
          aria-label="Your short link"
          className="animate-rise mt-8 overflow-hidden rounded-2xl border border-emerald-400/25 bg-gradient-to-b from-emerald-400/10 to-white/[0.03] p-5 backdrop-blur sm:p-6"
        >
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
            <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full bg-emerald-400/20 text-xs">
              ✓
            </span>
            Your short link is ready
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-2xl font-semibold text-white hover:text-cyan-300 sm:text-3xl"
            >
              {result.shortUrl}
            </a>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => copy(result.shortUrl)}
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 active:scale-[0.98]"
              >
                {copied === result.shortUrl ? "Copied ✓" : "Copy"}
              </button>
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open ↗
              </a>
            </div>
          </div>
          <p className="mt-4 truncate border-t border-white/10 pt-3 text-sm text-slate-400" title={result.originalUrl}>
            <span className="text-slate-500">Original: </span>
            {result.originalUrl}
          </p>
          <p role="status" className="sr-only">
            {copied === result.shortUrl ? "Copied to clipboard" : ""}
          </p>
        </section>
      )}

      {recent.length > 0 && (
        <section aria-label="Recent links" className="mt-10">
          <h2 className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Recent links</h2>
          <ul className="mt-3 space-y-2">
            {recent.map((l) => (
              <li
                key={l.shortUrl}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="min-w-0">
                  <a
                    href={l.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-semibold text-violet-300 hover:text-cyan-300"
                  >
                    {l.shortUrl}
                  </a>
                  <p className="truncate text-xs text-slate-500" title={l.originalUrl}>
                    {l.originalUrl}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copy(l.shortUrl)}
                  className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                >
                  {copied === l.shortUrl ? "Copied ✓" : "Copy"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
