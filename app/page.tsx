import Link from "next/link";
import type { Metadata } from "next";
import { neonAuth } from "@neondatabase/auth/next/server";

const title = "Food Passport | Restaurant tracker for your food world";
const description =
  "Log and share restaurant visits, see your food world by place, and compare notes with friends and their best recommendations.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

interface ChallengeItem {
  title: string;
  description: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

const challengeItems: ChallengeItem[] = [
  {
    title: "Asian top cuisines",
    description: "Collect stamps across the most-loved Asian cuisines.",
  },
  {
    title: "Europe must-try",
    description: "Hit the classics across Europe, one city at a time.",
  },
  {
    title: "Top 20 by population",
    description: "Earn achievements as you taste your way through big nations.",
  },
];

const faqItems: FaqItem[] = [
  {
    question: "Is Food Passport a restaurant tracker?",
    answer:
      "Yes. It is built for logging restaurants and keeping a visual map of your visits by place.",
  },
  {
    question: "How do challenges and achievements work?",
    answer:
      "Challenges are coming soon. You will unlock achievements as you complete curated goals.",
  },
  {
    question: "Can I organize visits with friends?",
    answer:
      "Group planning is coming soon so you can align on places and compare notes together.",
  },
  {
    question: "Do I need an account to save visits?",
    answer: "Yes. You will need an account to save places and your progress.",
  },
];

export default async function LandingPage() {
  const { user } = await neonAuth();

  return (
    <main
      className={`min-h-screen bg-[radial-gradient(70%_80%_at_50%_0%,#fff7e6_0%,#f4f1ea_55%,#efe8dc_100%)] text-slate-950`}
    >
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 pb-16 pt-8">
        <nav className="flex items-center justify-between text-sm text-slate-600">
          <Link href="/" className="font-medium text-slate-950">
            Food Passport
          </Link>
          {user ? (
            <Link href="/dashboard" className="hover:text-slate-900">
              Go to dashboard
            </Link>
          ) : (
            <Link href="/auth/sign-in" className="hover:text-slate-900">
              Sign In
            </Link>
          )}
        </nav>

        <section className="mt-20 flex flex-1 flex-col items-center justify-center text-center">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
            Food Passport is the restaurant tracker for your food world.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            One place to log and share your visits around the food world.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/auth/sign-up"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Get Started
            </Link>
            <Link
              href="/auth/sign-in"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm text-slate-900 transition hover:border-slate-400"
            >
              Book a demo
            </Link>
          </div>
        </section>

        <section className="mt-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
            See your food world, by place.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            Food Passport lets you visually see all the food you know, by place,
            at a glance. You can compete against your friends or follow their
            best recommendations when you need a sure thing.
          </p>
        </section>

        <section className="mt-14 w-full">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-2xl font-semibold text-slate-900">
              Challenges, achievements, and friends
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
              A gamified, social way to enjoy new restaurants and keep the fun
              going with your crew.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Challenges and achievements
                </h3>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  Coming soon
                </span>
              </div>
              <div className="mt-5 grid gap-4">
                {challengeItems.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </h4>
                      <span className="rounded-full border border-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        Coming soon
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Organize visits with friends
                </h3>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                  Coming soon
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Plan restaurant runs together, keep shared wishlists, and make
                it easy to pick the next spot when the group chat is stuck.
              </p>
              <div className="mt-6 rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 px-4 py-4 text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Social playbook
                </p>
                <p className="mt-2 text-sm text-amber-900">
                  Create a weekend plan, invite friends, and earn shared
                  achievements together.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 w-full">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900">FAQ</h2>
            <p className="mt-3 text-base text-slate-600 md:text-lg">
              Short answers to the most common questions.
            </p>
          </div>
          <div className="mt-8 grid gap-4">
            {faqItems.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-4"
              >
                <h3 className="text-sm font-semibold text-slate-900">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-16 border-t border-slate-200 pt-8 text-sm text-slate-600">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <span>Food Passport</span>
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/privacy" className="hover:text-slate-900">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-slate-900">
                Terms
              </Link>
              <a
                href="mailto:contact@worldfoodpassport.com"
                className="hover:text-slate-900"
              >
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
