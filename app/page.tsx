import Link from "next/link";
import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";

import { AuthNavLink } from "./_components/auth-nav-link";
import { MapExample } from "./_components/map-example";

const title = "World Food Passport | Restaurant tracker for your food world";
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

interface TrustSignalItem {
	title: string;
	description: string;
}

interface SectionShellProps {
	id: string;
	label: string;
	title: string;
	description: string;
	children: ReactNode;
	className?: string;
}

const challengeItems: ChallengeItem[] = [
	{
		title: "Asian Top Cuisines",
		description: "Collect stamps across the most-loved Asian cuisines.",
	},
	{
		title: "Europe Must-Try",
		description: "Hit the classics across Europe, one city at a time.",
	},
	{
		title: "Top 20 by Population",
		description:
			"Earn achievements as you taste through the world's biggest nations.",
	},
];

const faqItems: FaqItem[] = [
	{
		question: "Is World Food Passport a restaurant tracker?",
		answer:
			"Yes. It is built for logging restaurants and keeping a visual map of your visits by place.",
	},
	{
		question: "How do challenges and achievements work?",
		answer:
			"Challenges are coming soon. You will unlock curated achievement stamps as you complete food milestones.",
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

const trustSignalItems: TrustSignalItem[] = [
	{
		title: "Real product preview",
		description:
			"See an actual passport map module before you create an account.",
	},
	{
		title: "Track by location",
		description:
			"Log restaurants by country and city so memories stay tied to place.",
	},
	{
		title: "Built for repeat use",
		description:
			"Keep notes, revisit favorites, and steadily grow your personal food map.",
	},
];

function SectionShell({
	id,
	label,
	title,
	description,
	children,
	className,
}: SectionShellProps) {
	return (
		<section
			id={id}
			aria-labelledby={`${id}-title`}
			className={`border-t border-[#D3DAE6] pt-10 sm:pt-12 ${className ?? ""}`}
		>
			<p className="text-sm font-medium italic tracking-[0.01em] text-[#5B6472]">
				{label}
			</p>
			<h2
				id={`${id}-title`}
				className="mt-3 max-w-3xl text-3xl font-medium leading-tight tracking-[-0.01em] text-[#1E3557] md:text-4xl"
			>
				{title}
			</h2>
			<p className="mt-4 max-w-3xl text-base leading-relaxed text-[#5B6472] md:text-lg">
				{description}
			</p>
			<div className="mt-7 md:mt-8">{children}</div>
		</section>
	);
}

export default function LandingPage() {
	return (
		<main className="min-h-screen bg-[#F5EFE3] text-[#1F2937]">
			<div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-20 pt-8 sm:px-6 lg:px-8">
				<nav className="flex items-center justify-between text-sm text-[#5B6472]">
					<Link href="/" className="text-lg font-medium text-[#1E3557]">
						World Food Passport
					</Link>
					<Suspense
						fallback={
							<Link href="/auth/sign-in" className="hover:text-[#1E3557]">
								Sign In
							</Link>
						}
					>
						<AuthNavLink />
					</Suspense>
				</nav>

				<div className="mt-10 flex flex-col gap-14 sm:mt-12 sm:gap-16 lg:gap-20">
					<section
						aria-labelledby="hero-title"
						className="rounded-[30px] border border-[#E4E9F2] bg-gradient-to-b from-[#FFFDF8] to-[#FFF8EC] px-5 py-6 shadow-[0_22px_44px_-34px_rgba(30,53,87,0.5)] sm:px-8 sm:py-8 lg:px-10 lg:py-10"
					>
						<p className="text-sm font-medium italic tracking-[0.01em] text-[#5B6472]">
							Passport map tracker
						</p>
						<div className="mt-5 grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr] lg:gap-10">
							<div>
								<h1
									id="hero-title"
									className="max-w-xl text-4xl font-bold leading-[1.08] tracking-[-0.015em] text-[#1E3557] md:text-5xl"
								>
									Turn every great meal into a stamp on your world map.
								</h1>
								<p className="mt-4 max-w-xl text-base leading-relaxed text-[#5B6472] md:text-lg">
									Track restaurants by place, save what was worth it, and build
									a food passport you can actually use for your next decision.
								</p>
								<div className="mt-7 flex flex-wrap items-center gap-3">
									<Link
										href="/auth/sign-up"
										className="rounded-full bg-[#1E3557] px-6 py-3 text-sm font-medium text-white hover:bg-[#172a45]"
									>
										Claim Your First Stamp
									</Link>
									<Link
										href="/auth/sign-in"
										className="rounded-full border border-[#D3DAE6] bg-[#FFFDF8] px-6 py-3 text-sm font-normal text-[#1E3557] hover:border-[#B8C3D4]"
									>
										Sign In and Continue
									</Link>
								</div>
							</div>

							<div className="rounded-3xl border border-[#E4E9F2] bg-[#FFFDF8] p-4 shadow-[0_12px_30px_-26px_rgba(30,53,87,0.45)] md:p-6">
								<div className="flex items-center justify-between gap-3">
									<span className="rounded-full bg-[#D9A441]/20 px-3 py-1 text-xs font-medium text-[#7A5827]">
										Live preview
									</span>
									<span className="text-xs text-[#5B6472]">
										Sample data shown
									</span>
								</div>
								<div className="mt-3 rounded-2xl border border-[#E4E9F2] bg-white p-3 md:p-4">
									<MapExample />
								</div>
							</div>
						</div>

						<div className="mt-9 grid gap-3 sm:gap-4 md:grid-cols-3">
							{trustSignalItems.map((item) => (
								<div
									key={item.title}
									className="rounded-2xl border border-[#E4E9F2] bg-white px-4 py-4"
								>
									<p className="text-sm font-medium text-[#1E3557]">
										{item.title}
									</p>
									<p className="mt-2 text-sm leading-relaxed text-[#5B6472]">
										{item.description}
									</p>
								</div>
							))}
						</div>
					</section>

					<SectionShell
						id="story"
						label="Why this feels different"
						title="Meals become memories when context is easy to revisit."
						description="Most restaurant apps become long lists. World Food Passport keeps every place connected to location, so your history stays useful when you want to plan what is next."
					>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="rounded-2xl border border-[#E4E9F2] bg-white px-5 py-5">
								<p className="text-base font-medium text-[#1E3557]">
									From list to story
								</p>
								<p className="mt-3 text-sm leading-relaxed text-[#5B6472]">
									Every saved restaurant includes where it happened, what stood
									out, and why you would return. Your passport becomes a real
									memory guide, not a backlog you forget.
								</p>
							</div>
							<div className="rounded-2xl border border-[#E4E9F2] bg-[#F8FBFF] px-5 py-5">
								<p className="text-base font-medium text-[#1E3557]">
									Practical every week
								</p>
								<p className="mt-3 text-sm leading-relaxed text-[#5B6472]">
									Use your map to answer familiar questions quickly: where to go
									this weekend, what is worth revisiting, and which places to
									share with friends who trust your taste.
								</p>
							</div>
						</div>
					</SectionShell>

					<SectionShell
						id="challenges"
						label="Challenges and achievements"
						title="Challenges and achievement stamps keep your map growing."
						description="This is the strongest next layer of the product: clear milestones that make exploration feel directed without turning it into a game overload."
					>
						<div className="rounded-[28px] border border-[#E8DAB9] bg-[#FFF9EE] p-5 sm:p-6 lg:p-8">
							<div className="flex items-start justify-between gap-4">
								<p className="max-w-2xl text-sm leading-relaxed text-[#5B6472]">
									Complete curated food tracks, unlock stamp-style achievements,
									and see your progress by cuisine and region.
								</p>
								<span className="rounded-full bg-[#D9A441]/20 px-3 py-1 text-xs font-medium text-[#7A5827]">
									Coming soon
								</span>
							</div>

							<div className="mt-6 grid gap-4 md:grid-cols-3">
								{challengeItems.map((item) => (
									<div
										key={item.title}
										className="rounded-2xl border border-[#E8DAB9] bg-[#FFFDF8] px-4 py-4"
									>
										<div className="flex items-center justify-between gap-3">
											<h3 className="text-sm font-medium text-[#1E3557]">
												{item.title}
											</h3>
											<span className="rounded-full border border-[#D9A441]/60 px-2 py-0.5 text-[11px] font-medium text-[#8B6A34]">
												Soon
											</span>
										</div>
										<p className="mt-2 text-sm leading-relaxed text-[#5B6472]">
											{item.description}
										</p>
									</div>
								))}
							</div>
						</div>
					</SectionShell>

					<SectionShell
						id="social"
						label="Shared recommendations"
						title="Find the next spot faster with people you trust."
						description="Recommendation quality improves when you can see where friends actually go and what they thought, without digging through old chats."
					>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="rounded-2xl border border-[#E4E9F2] bg-white px-5 py-5">
								<h3 className="text-base font-medium text-[#1E3557]">
									Shared shortlist, less debate
								</h3>
								<p className="mt-3 text-sm leading-relaxed text-[#5B6472]">
									Build a short list together, compare notes side by side, and
									choose faster when it is time to book a table.
								</p>
							</div>
							<div className="rounded-2xl border border-[#E4E9F2] bg-[#F8FBFF] px-5 py-5">
								<h3 className="text-base font-medium text-[#1E3557]">
									Recommendations with context
								</h3>
								<p className="mt-3 text-sm leading-relaxed text-[#5B6472]">
									See who recommended a place, when they visited, and what they
									loved so choices feel informed, not random.
								</p>
							</div>
						</div>
					</SectionShell>

					<SectionShell
						id="faq"
						label="Trust and practical details"
						title="Quick answers before your first stamp."
						description="Everything important up front so you can sign up with confidence."
					>
						<div className="grid gap-4">
							{faqItems.map((item) => (
								<div
									key={item.question}
									className="rounded-2xl border border-[#E4E9F2] bg-white px-5 py-4"
								>
									<h3 className="text-sm font-medium text-[#1E3557]">
										{item.question}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-[#5B6472]">
										{item.answer}
									</p>
								</div>
							))}
						</div>

						<div className="mt-6 rounded-2xl border border-[#D3DAE6] bg-[#F8FBFF] px-5 py-5 sm:flex sm:items-center sm:justify-between sm:gap-4">
							<div>
								<p className="text-sm font-medium text-[#1E3557]">
									Ready to start your passport?
								</p>
								<p className="mt-1 text-sm text-[#5B6472]">
									Create your account and log your first restaurant in minutes.
								</p>
							</div>
							<Link
								href="/auth/sign-up"
								className="mt-4 inline-flex rounded-full bg-[#1E3557] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#172a45] sm:mt-0"
							>
								Sign Up Now
							</Link>
						</div>
					</SectionShell>
				</div>

				<footer className="mt-14 border-t border-[#D3DAE6] pt-8 text-sm text-[#5B6472]">
					<div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
						<span className="text-base font-medium text-[#1E3557]">
							World Food Passport
						</span>
						<div className="flex flex-wrap items-center gap-4">
							<Link href="/privacy" className="hover:text-[#1E3557]">
								Privacy
							</Link>
							<Link href="/terms" className="hover:text-[#1E3557]">
								Terms
							</Link>
							<a
								href="mailto:contact@worldfoodpassport.com"
								className="hover:text-[#1E3557]"
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
