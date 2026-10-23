import UrlShortener from "@/components/UrlShortener";

const features = [
  { title: "Instant", text: "Short codes generated securely in milliseconds." },
  { title: "302 redirects", text: "Server-side, never cached as permanent." },
  { title: "Persistent", text: "Stored in MongoDB, safe across restarts." },
];

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-float absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-[90%] rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="animate-float absolute top-20 left-1/2 h-[420px] w-[420px] translate-x-[10%] rounded-full bg-cyan-500/25 blur-[120px] [animation-delay:-6s]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      </div>

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.43" />
              <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.33-1.33" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">LinkLite</span>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          Next.js · MongoDB
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-5 pt-10 pb-20 sm:pt-20">
        <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-3.5 py-1 text-xs font-medium text-violet-200">
          ✦ Clean, shareable links
        </span>
        <h1 className="mt-6 text-center text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Shorten your links{" "}
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
            in seconds
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-center text-base text-slate-400 sm:text-lg">
          Paste your long URL and generate a clean, shareable short link instantly.
        </p>

        <div className="mt-10 w-full">
          <UrlShortener />
        </div>

        <ul className="mt-14 grid w-full gap-3 sm:grid-cols-3">
          {features.map((f) => (
            <li key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
              <p className="text-sm font-semibold text-white">{f.title}</p>
              <p className="mt-1 text-sm text-slate-400">{f.text}</p>
            </li>
          ))}
        </ul>
      </main>

      <footer className="pb-8 text-center text-xs text-slate-500">
        LinkLite · Built for the WedigTech assignment
      </footer>
    </div>
  );
}
