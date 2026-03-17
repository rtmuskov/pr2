-- CreateTable
CREATE TABLE "GameCase" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "product" JSONB NOT NULL,
    "documents" JSONB NOT NULL,
    "issues" JSONB NOT NULL,
    "correctDecision" "DecisionType" NOT NULL,
    "explanation" TEXT NOT NULL,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameCase_level_idx" ON "GameCase"("level");

-- CreateIndex
CREATE INDEX "GameCase_createdAt_idx" ON "GameCase"("createdAt");
