import { DM_Sans } from "next/font/google";
import { ChallengesContent } from "@/components/challenges-content";
import { getQueryClient, trpc } from "@/trpc/server";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default async function DashboardChallengesPage() {
  const queryClient = getQueryClient();
  const challenges = await queryClient.fetchQuery(
    trpc.challenges.getV1Summary.queryOptions(),
  );

  const asianTopCuisinesChallenge = challenges.find(
    (challenge) => challenge.challengeId === "asian-top-cuisines",
  );

  if (!asianTopCuisinesChallenge) {
    return null;
  }

  return (
    <div
      className={`${dmSans.className} min-h-screen bg-[radial-gradient(70%_80%_at_50%_0%,#fff7e6_0%,#f4f1ea_55%,#efe8dc_100%)] text-slate-950`}
    >
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <section>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Dashboard</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
            Challenges
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            Track your curated goals and unlock achievements as you visit target countries.
          </p>
        </section>

        <section className="mt-8">
          <ChallengesContent challenge={asianTopCuisinesChallenge} />
        </section>
      </div>
    </div>
  );
}
