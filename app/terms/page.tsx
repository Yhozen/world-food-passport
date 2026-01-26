import Link from "next/link";
import type { Metadata } from "next";

const title = "Terms of Service | World Food Passport";
const description =
  "Review the terms that govern your use of World Food Passport.";

export const metadata: Metadata = {
  title,
  description,
};

interface Section {
  title: string;
  description: string;
  items?: string[];
}

const sections: Section[] = [
  {
    title: "Agreement",
    description:
      "By using World Food Passport, you agree to these terms. If you do not agree, please do not use the service.",
  },
  {
    title: "Accounts",
    description:
      "You are responsible for the activity that happens under your account and for keeping your login credentials secure.",
  },
  {
    title: "Your content",
    description:
      "You own the content you add. By posting it, you grant World Food Passport a limited license to host, store, and display it so we can operate the service.",
  },
  {
    title: "Acceptable use",
    description:
      "Please use World Food Passport respectfully and lawfully.",
    items: [
      "Do not misuse the service or attempt to access it in unauthorized ways.",
      "Do not upload content that is illegal, harmful, or infringes on the rights of others.",
      "Do not interfere with the security or performance of the platform.",
    ],
  },
  {
    title: "Changes and availability",
    description:
      "We may update features, pricing, or the service itself as the product evolves. We will provide notice for material changes when required.",
  },
  {
    title: "Termination",
    description:
      "You may stop using World Food Passport at any time. We may suspend or terminate access if these terms are violated or to protect the service and its users.",
  },
  {
    title: "Disclaimers",
    description:
      "The service is provided on an \"as-is\" and \"as-available\" basis. We do not guarantee that it will be uninterrupted or error-free.",
  },
  {
    title: "Limitation of liability",
    description:
      "To the extent permitted by law, World Food Passport will not be liable for indirect, incidental, or consequential damages resulting from your use of the service.",
  },
  {
    title: "Governing law",
    description:
      "These terms are governed by the laws of the jurisdiction where World Food Passport is established, without regard to conflict of law rules.",
  },
  {
    title: "Contact",
    description:
      "Questions about these terms? Reach us at contact@worldfoodpassport.com.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(70%_80%_at_50%_0%,#fff7e6_0%,#f4f1ea_55%,#efe8dc_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 pb-16 pt-8">
        <nav className="flex items-center justify-between text-sm text-slate-600">
          <Link href="/" className="font-medium text-slate-950">
            World Food Passport
          </Link>
          <Link href={{ pathname: "/privacy" }} className="hover:text-slate-900">
            Privacy
          </Link>
        </nav>

        <section className="mt-12 text-left">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-700">
            Terms
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            Effective date: Jan 26, 2026
          </p>
        </section>

        <section className="mt-10 grid gap-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-5"
            >
              <h2 className="text-base font-semibold text-slate-900">
                {section.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {section.description}
              </p>
              {section.items ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </section>

        <footer className="mt-14 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span>World Food Passport</span>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={{ pathname: "/privacy" }}
                className="hover:text-slate-900"
              >
                Privacy
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
