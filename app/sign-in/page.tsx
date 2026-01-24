"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "@/lib/actions";
import { Utensils, Lock, ArrowLeft } from "lucide-react";

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Neon glow effects */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-secondary/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 font-mono text-sm uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="border-4 border-black bg-card p-8 shadow-[8px_8px_0px_0px_#000]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-secondary border-4 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
              <Utensils className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold uppercase">Welcome Back</h1>
              <p className="text-sm text-muted-foreground">
                Continue your journey
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 border-4 border-black bg-destructive text-destructive-foreground font-bold">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold uppercase mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 border-4 border-black bg-background text-foreground font-mono focus:outline-none focus:ring-4 focus:ring-secondary/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold uppercase mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-4 py-3 border-4 border-black bg-background text-foreground font-mono focus:outline-none focus:ring-4 focus:ring-secondary/50"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 border-4 border-black bg-secondary text-black font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-4 border-black">
            <div className="flex items-center justify-center gap-2 text-accent text-sm">
              <Lock className="w-4 h-4" />
              <span className="font-mono uppercase">
                Your data stays private
              </span>
            </div>
          </div>

          <p className="mt-6 text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="text-secondary font-bold underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
