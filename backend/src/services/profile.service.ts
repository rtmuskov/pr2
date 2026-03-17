import { prisma } from '../config/prisma.js';

export async function getProfileInfoPayload(userId: string) {
  const user = await prisma.user.findUnique({
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
    },
  });

  if (!user) {
    return null;
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    profile: user.profile,
    progress: user.progress,
  };
}
