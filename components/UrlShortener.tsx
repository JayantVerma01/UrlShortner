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
    <div className="w-full max-w-xl">
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <label htmlFor="url" className="block text-sm font-medium text-slate-700">
          Long URL
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
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
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Shortening…" : "Shorten"}
          </button>
        </div>
        {error && (
          <p id="url-error" role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </form>

      {result && (
        <section
          aria-label="Your short link"
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm text-slate-500">Your short link</p>
          <a
            href={result.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block break-all text-lg font-semibold text-indigo-600 hover:underline"
          >
            {result.shortUrl}
          </a>
          <p className="mt-1 truncate text-sm text-slate-500" title={result.originalUrl}>
            {result.originalUrl}
          </p>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => copy(result.shortUrl)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {copied === result.shortUrl ? "Copied!" : "Copy"}
            </button>
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Open
            </a>
          </div>
          <p role="status" className="sr-only">
            {copied === result.shortUrl ? "Copied to clipboard" : ""}
          </p>
        </section>
      )}

      {recent.length > 0 && (
        <section aria-label="Recent links" className="mt-8">
          <h2 className="text-sm font-semibold text-slate-700">Recent links</h2>
          <ul className="mt-2 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {recent.map((l) => (
              <li key={l.shortUrl} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <a
                    href={l.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium text-indigo-600 hover:underline"
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
                  className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  {copied === l.shortUrl ? "Copied!" : "Copy"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
