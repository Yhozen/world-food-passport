import Link from "next/link";
import { neonAuth } from "@neondatabase/auth/next/server";

export async function AuthNavLink() {
  const { user } = await neonAuth();

  if (!user) {
    return (
      <Link href="/auth/sign-in" className="hover:text-slate-900">
        Sign In
      </Link>
    );
  }

  return (
    <Link
      href="/dashboard"
      className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-slate-800"
    >
      Go to dashboard
    </Link>
  );
}
