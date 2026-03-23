interface ChallengeSummary {
  challengeId: string;
  title: string;
  description: string;
  targetCountryCodes: string[];
  milestones: number[];
  completionThreshold: number | null;
  completionUnlockKey: string;
  uniqueTargetCount: number;
  unlockedCountryCodes: string[];
  unlockedAchievements: string[];
}

interface ChallengesContentProps {
  challenge: ChallengeSummary;
}

export function ChallengesContent({ challenge }: ChallengesContentProps) {
  const targetCount = challenge.completionThreshold ?? challenge.targetCountryCodes.length;
  const progressPercentage = Math.min(
    100,
    Math.round((challenge.uniqueTargetCount / Math.max(targetCount, 1)) * 100),
  );

  const achievementKeys = [
    ...challenge.milestones.map((milestone) => `milestone_${milestone}`),
    challenge.completionUnlockKey,
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{challenge.title}</h2>
      <p className="mt-2 text-sm text-slate-600">{challenge.description}</p>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-700">
        <span className="font-medium">Progress</span>
        <span>{challenge.uniqueTargetCount} / {targetCount} countries</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Target countries
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {challenge.targetCountryCodes.map((countryCode) => {
              const isUnlocked = challenge.unlockedCountryCodes.includes(countryCode);

              return (
                <li key={countryCode} className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded border text-xs ${
                      isUnlocked
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 text-slate-400"
                    }`}
                  >
                    {isUnlocked ? "\u2713" : ""}
                  </span>
                  <span>{countryCode}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Achievement badges
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {achievementKeys.map((achievementKey) => {
              const isUnlocked = challenge.unlockedAchievements.includes(achievementKey);

              return (
                <span
                  key={achievementKey}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                    isUnlocked
                      ? "border-amber-200 bg-amber-100 text-amber-800"
                      : "border-slate-200 bg-slate-100 text-slate-600"
                  }`}
                >
                  {achievementKey}
                </span>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
