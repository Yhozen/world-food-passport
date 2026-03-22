// @vitest-environment node
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

function readPrismaSchema(): string {
  return readFileSync(path.join(process.cwd(), "prisma/schema.prisma"), "utf8");
}

describe("challenge persistence contract", () => {
  test("stores a single progress row per user and challenge", () => {
    const schema = readPrismaSchema();

    expect(schema).toContain("model ChallengeProgress");
    expect(schema).toContain("@@unique([userId, challengeId])");
  });
});
