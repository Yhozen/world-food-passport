import { prisma } from "@/lib/prisma";

export interface EnqueueChallengeRepairJobInput {
  userId: string;
  challengeId: string;
  reason: string;
}

export async function enqueueChallengeRepairJob({
  userId,
  challengeId,
  reason,
}: EnqueueChallengeRepairJobInput): Promise<boolean> {
  try {
    await prisma.challengeRepairJob.create({
      data: {
        userId,
        challengeId,
        reason,
      },
    });

    return true;
  } catch {
    return false;
  }
}
