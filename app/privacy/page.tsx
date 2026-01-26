import Link from "next/link";
import type { Metadata } from "next";

const title = "Privacy Policy | Food Passport";
const description =
  "Learn how Food Passport handles your information and protects your privacy.";

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
    title: "Overview",
    description:
      "Food Passport helps you log restaurant visits and keep track of your food world. This policy explains what we collect, how we use it, and the choices you have.",
  },
  {
    title: "Information we collect",
    description:
      "We keep data collection simple and limited to what the service needs to work.",
    items: [
      "Account details you provide, such as name and email.",
      "Content you add, like restaurant visits, notes, and tags.",
      "Basic technical data needed to keep the service secure and reliable, such as device and log information.",
    ],
  },
  {
    title: "How we use information",
    description:
      "We use your information to deliver the product and improve it over time.",
    items: [
      "Create and manage your account.",
      "Store and display your saved visits and preferences.",
      "Maintain security, prevent abuse, and provide support.",
    ],
  },
  {
    title: "Sharing",
    description:
      "We do not sell your personal information. We only share data when needed to operate the service, and we would provide clear notice before any material change in how data is used.",
    items: [
      "With trusted service providers that help us run the platform (hosting, authentication).",
      "If required by law or to protect our rights and users.",
    ],
  },
  {
    title: "Retention",
    description:
      "We keep your data while your account is active. You can request deletion at any time, and we will remove your data within a reasonable period.",
  },
  {
    title: "Your choices",
    description:
      "You can update your profile and manage your content. If you need help exporting or deleting your data, contact us and we will assist.",
  },
  {
    title: "Changes",
    description:
      "As Food Passport grows, we may update this policy. If we make material changes, we will update the date here and make the new policy available before it takes effect.",
  },
  {
    title: "Contact",
    description:
      "Questions about privacy? Reach us at contact@worldfoodpassport.com.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(70%_80%_at_50%_0%,#fff7e6_0%,#f4f1ea_55%,#efe8dc_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 pb-16 pt-8">
        <nav className="flex items-center justify-between text-sm text-slate-600">
          <Link href="/" className="font-medium text-slate-950">
            Food Passport
          </Link>
          <Link href={{ pathname: "/terms" }} className="hover:text-slate-900">
            Terms
          </Link>
        </nav>

        <section className="mt-12 text-left">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-700">
            Policy
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 md:text-4xl">
            Privacy Policy
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
            <span>Food Passport</span>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={{ pathname: "/terms" }}
                className="hover:text-slate-900"
              >
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
