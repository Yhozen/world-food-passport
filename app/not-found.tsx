import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[radial-gradient(70%_80%_at_50%_0%,#fff7e6_0%,#f4f1ea_55%,#efe8dc_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 pb-16 pt-8">
        <nav className="flex items-center justify-between text-sm text-slate-600">
          <Link href="/" className="font-medium text-slate-950">
            World Food Passport
          </Link>
          <Link href="/dashboard" className="hover:text-slate-900">
            Go to dashboard
          </Link>
        </nav>

        <section className="mt-20 flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-200 bg-amber-100 text-2xl">
              *
            </div>
            <div className="rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Passport Control
            </div>
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
            This page did not get stamped.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
            The route you are looking for is off the map. Grab a new destination
            or head back to the main terminal.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Return home
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm text-slate-900 transition hover:border-slate-400"
            >
              View my map
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
