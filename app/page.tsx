import UrlShortener from "@/components/UrlShortener";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-16 sm:py-24">
      <p className="text-sm font-semibold tracking-wide text-indigo-600">LinkLite</p>
      <h1 className="mt-3 text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Shorten your links in seconds
      </h1>
      <p className="mt-4 mb-10 max-w-md text-center text-slate-600">
        Paste your long URL and generate a clean, shareable short link instantly.
      </p>
      <UrlShortener />
    </main>
  );
}
