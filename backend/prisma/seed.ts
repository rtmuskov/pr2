import 'dotenv/config';
import { PrismaClient, DecisionType, UserRole } from '@prisma/client';
import { rawCases } from '../../src/data/cases/index.ts';

const prisma = new PrismaClient();

function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function toDecisionType(value: string): DecisionType {
  switch (value) {
    case 'approve':
      return DecisionType.approve;
    case 'reject':
      return DecisionType.reject;
    case 'rework':
      return DecisionType.rework;
    case 'extra-review':
      return DecisionType.extra_review;
    default:
      throw new Error(`Unsupported decision type: ${value}`);
  }
}

function buildDocumentContent(gameCaseDocument: (typeof rawCases)[number]['documents'][number]): string {
  const sectionsContent = gameCaseDocument.sections
    .map((section) => `${section.title}\n${section.content}`)
    .join('\n\n');

  return [gameCaseDocument.summary, sectionsContent].filter(Boolean).join('\n\n');
}

function buildIssueDescription(gameCaseIssue: (typeof rawCases)[number]['issues'][number]): string {
  return `${gameCaseIssue.title}. ${gameCaseIssue.description}`;
}

async function main() {
  await prisma.user.upsert({
    where: { email: 'demo@qa-inspector.local' },
    update: {
      role: UserRole.USER,
    },
    create: {
      username: 'demo_user',
      email: 'demo@qa-inspector.local',
      passwordHash: '$2b$10$demo.hash.for.educational.project.only',
      role: UserRole.USER,
      profile: {
        create: {
          displayName: 'Демо инспектор',
          totalScore: 180,
          accuracy: 66.7,
          casesCompleted: 2,
          correctAnswers: 2,
          currentLevel: 2,
        },
      },
      progress: {
        create: {
          completedCaseIds: ['case-101', 'case-102'],
          unlockedLevels: [1, 2],
          lastPlayedAt: new Date(),
        },
      },
      gameResults: {
        create: [
          {
            caseId: 'case-101',
            selectedDecision: DecisionType.extra_review,
            isCorrect: true,
            scoreEarned: 110,
          },
          {
            caseId: 'case-102',
            selectedDecision: DecisionType.rework,
            isCorrect: true,
            scoreEarned: 120,
          },
        ],
      },
    },
  });

  const adminEmail = getOptionalEnv('FIRST_ADMIN_EMAIL');
  const adminUsername = getOptionalEnv('FIRST_ADMIN_USERNAME');
  const adminPasswordHash = getOptionalEnv('FIRST_ADMIN_PASSWORD_HASH');

  if (adminEmail && adminUsername && adminPasswordHash) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        username: adminUsername,
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
      },
      create: {
        email: adminEmail,
        username: adminUsername,
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
        profile: {
          create: {
            displayName: adminUsername,
            currentLevel: 1,
          },
        },
        progress: {
          create: {
            completedCaseIds: [],
            unlockedLevels: [1],
          },
        },
      },
    });

    console.log(`Admin ensured: ${adminEmail}`);
  } else {
    console.log('Admin seed skipped: FIRST_ADMIN_EMAIL / FIRST_ADMIN_USERNAME / FIRST_ADMIN_PASSWORD_HASH not set');
  }

  for (const gameCase of rawCases) {
    await prisma.case.upsert({
      where: { id: gameCase.id },
      update: {
        level: gameCase.level,
        title: gameCase.title,
        productName: gameCase.product.name,
        productVersion: gameCase.product.version,
        productType: gameCase.product.type,
        productDescription: gameCase.product.description,
        correctDecision: toDecisionType(gameCase.correctDecision),
        explanation: gameCase.explanation,
        topics: gameCase.topics,
        documents: {
          deleteMany: {},
          create: gameCase.documents.map((document) => ({
            id: document.id,
            type: document.type,
            title: document.title,
            content: buildDocumentContent(document),
          })),
        },
        issues: {
          deleteMany: {},
          create: gameCase.issues.map((issue) => ({
            id: issue.id,
            type: issue.severity,
            description: buildIssueDescription(issue),
          })),
        },
      },
      create: {
        id: gameCase.id,
        level: gameCase.level,
        title: gameCase.title,
        productName: gameCase.product.name,
        productVersion: gameCase.product.version,
        productType: gameCase.product.type,
        productDescription: gameCase.product.description,
        correctDecision: toDecisionType(gameCase.correctDecision),
        explanation: gameCase.explanation,
        topics: gameCase.topics,
        documents: {
          create: gameCase.documents.map((document) => ({
            id: document.id,
            type: document.type,
            title: document.title,
            content: buildDocumentContent(document),
          })),
        },
        issues: {
          create: gameCase.issues.map((issue) => ({
            id: issue.id,
            type: issue.severity,
            description: buildIssueDescription(issue),
          })),
        },
      },
    });
  }

  console.log(`Seeded ${rawCases.length} game cases`);
  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
