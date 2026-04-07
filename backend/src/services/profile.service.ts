import { prisma } from '../config/prisma.js';
import type { SubmitGameResultInput } from '../validators/profile.schemas.js';
import { toApiDecisionType, toPrismaDecisionType } from '../lib/decision-mapper.js';

const BASE_SCORE = 100;
const ISSUE_BONUS_PER_ITEM = 10;

function getScore(isCorrect: boolean, issueCount: number): number {
  if (!isCorrect) {
    return Math.max(0, Math.round(BASE_SCORE * 0.2));
  }

  return BASE_SCORE + issueCount * ISSUE_BONUS_PER_ITEM;
}

function toAccuracy(correctAnswers: number, casesCompleted: number): number {
  if (casesCompleted === 0) {
    return 0;
  }

  return Number(((correctAnswers / casesCompleted) * 100).toFixed(1));
}

function getComputedStats(
  results: Array<{
    isCorrect: boolean;
    scoreEarned: number;
  }>,
) {
  const casesCompleted = results.length;
  const correctAnswers = results.filter((result) => result.isCorrect).length;
  const totalScore = results.reduce((sum, result) => sum + result.scoreEarned, 0);
  const accuracy = toAccuracy(correctAnswers, casesCompleted);

  return {
    casesCompleted,
    correctAnswers,
    totalScore,
    accuracy,
  };
}

function toLeaderboardEntry(
  item: {
    userId: string;
    displayName: string;
    totalScore: number;
    accuracy: number;
    casesCompleted: number;
    currentLevel: number;
    user: {
      username: string;
    };
  },
  index: number,
  currentUserId?: string,
) {
  return {
    rank: index + 1,
    userId: item.userId,
    username: item.user.username,
    displayName: item.displayName,
    totalScore: item.totalScore,
    accuracy: item.accuracy,
    casesCompleted: item.casesCompleted,
    currentLevel: item.currentLevel,
    isCurrentUser: currentUserId === item.userId,
  };
}

function mergeUnlockedLevels(existingLevels: number[], completedLevel: number): number[] {
  const mergedLevels = new Set<number>(existingLevels);

  for (let level = 1; level <= Math.min(5, completedLevel + 1); level += 1) {
    mergedLevels.add(level);
  }

  return Array.from(mergedLevels).sort((left, right) => left - right);
}

export async function saveGameResult(userId: string, input: SubmitGameResultInput) {
  const prismaDecision = toPrismaDecisionType(input.selectedDecision);
  const gameCase = await prisma.case.findUnique({
    where: { id: input.caseId },
    select: {
      id: true,
      level: true,
      correctDecision: true,
      issues: {
        select: {
          id: true,
        },
      },
    },
  });
  const isCorrect = gameCase
    ? gameCase.correctDecision === prismaDecision
    : input.isCorrect;
  const scoreEarned = gameCase
    ? getScore(isCorrect, gameCase.issues.length)
    : input.scoreEarned;

  await prisma.$transaction(async (transaction) => {
    await transaction.gameResult.deleteMany({
      where: {
        userId,
        caseId: input.caseId,
      },
    });

    await transaction.gameResult.create({
      data: {
        userId,
        caseId: input.caseId,
        selectedDecision: prismaDecision,
        isCorrect,
        scoreEarned,
      },
    });

    const allResults = await transaction.gameResult.findMany({
      where: { userId },
      select: {
        caseId: true,
        isCorrect: true,
        scoreEarned: true,
      },
    });
    const existingProgress = await transaction.userProgress.findUnique({
      where: { userId },
      select: {
        unlockedLevels: true,
      },
    });

    const completedCaseIds = allResults.map((result) => result.caseId);
    const { casesCompleted, correctAnswers, totalScore, accuracy } = getComputedStats(allResults);

    const unlockedLevels = mergeUnlockedLevels(existingProgress?.unlockedLevels ?? [1], input.level);
    const currentLevel = unlockedLevels.at(-1) ?? 1;

    await transaction.userProfile.update({
      where: { userId },
      data: {
        totalScore,
        accuracy,
        casesCompleted,
        correctAnswers,
        currentLevel,
      },
    });

    await transaction.userProgress.update({
      where: { userId },
      data: {
        completedCaseIds,
        unlockedLevels,
        lastPlayedAt: new Date(),
      },
    });
  });

  const updatedProfile = await getProfileInfoPayload(userId);

  return {
    caseId: input.caseId,
    selectedDecision: input.selectedDecision,
    expectedDecision: gameCase
      ? toApiDecisionType(gameCase.correctDecision)
      : input.expectedDecision,
    isCorrect,
    scoreEarned,
    profile: updatedProfile?.profile ?? null,
    progress: updatedProfile?.progress ?? null,
  };
}

export async function getProfileInfoPayload(userId: string) {
  const [user, leaderboardProfiles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        profile: {
          select: {
            displayName: true,
            avatarUrl: true,
            totalScore: true,
            accuracy: true,
            casesCompleted: true,
            correctAnswers: true,
            currentLevel: true,
          },
        },
        progress: {
          select: {
            completedCaseIds: true,
            unlockedLevels: true,
            lastPlayedAt: true,
          },
        },
        gameResults: {
          select: {
            caseId: true,
            isCorrect: true,
            scoreEarned: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    }),
    prisma.userProfile.findMany({
      take: 10,
      orderBy: [
        { totalScore: 'desc' },
        { accuracy: 'desc' },
        { casesCompleted: 'desc' },
        { currentLevel: 'desc' },
      ],
      select: {
        userId: true,
        displayName: true,
        totalScore: true,
        accuracy: true,
        casesCompleted: true,
        currentLevel: true,
        user: {
          select: {
            username: true,
          },
        },
      },
    }),
  ]);

  if (!user) {
    return null;
  }

  const computedStats = getComputedStats(user.gameResults);
  const currentLevel = user.progress?.unlockedLevels.at(-1) ?? user.profile?.currentLevel ?? 1;

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    profile: user.profile
      ? {
          ...user.profile,
          totalScore: computedStats.totalScore,
          accuracy: computedStats.accuracy,
          casesCompleted: computedStats.casesCompleted,
          correctAnswers: computedStats.correctAnswers,
          currentLevel,
        }
      : null,
    progress: user.progress,
    results: user.gameResults.map((result) => ({
      caseId: result.caseId,
      isCorrect: result.isCorrect,
      scoreEarned: result.scoreEarned,
      createdAt: result.createdAt.toISOString(),
    })),
    leaderboard: leaderboardProfiles.map((item, index) =>
      toLeaderboardEntry(item, index, userId),
    ),
  };
}
