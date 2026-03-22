export interface ChallengeStartedEvent {
  challengeId: string;
  userId: string;
  enrolledAt: Date;
}

export interface AchievementUnlockedEvent {
  challengeId: string;
  userId: string;
  achievementKey: string;
  unlockedAt: Date;
}

type ChallengeStartedListener = (event: ChallengeStartedEvent) => void;
type AchievementUnlockedListener = (event: AchievementUnlockedEvent) => void;

const challengeStartedListeners = new Set<ChallengeStartedListener>();
const achievementUnlockedListeners = new Set<AchievementUnlockedListener>();

export function onChallengeStarted(listener: ChallengeStartedListener): () => void {
  challengeStartedListeners.add(listener);
  return () => {
    challengeStartedListeners.delete(listener);
  };
}

export function onAchievementUnlocked(listener: AchievementUnlockedListener): () => void {
  achievementUnlockedListeners.add(listener);
  return () => {
    achievementUnlockedListeners.delete(listener);
  };
}

export function emitChallengeStarted(event: ChallengeStartedEvent): void {
  for (const listener of challengeStartedListeners) {
    listener(event);
  }
}

export function emitAchievementUnlocked(event: AchievementUnlockedEvent): void {
  for (const listener of achievementUnlockedListeners) {
    listener(event);
  }
}

export function resetChallengeMetricsListeners(): void {
  challengeStartedListeners.clear();
  achievementUnlockedListeners.clear();
}
