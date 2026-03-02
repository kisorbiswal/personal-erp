-- CreateTable
CREATE TABLE "BoardPin" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BoardPin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BoardPin_eventId_idx" ON "BoardPin"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardPin_boardId_eventId_key" ON "BoardPin"("boardId", "eventId");

-- AddForeignKey
ALTER TABLE "BoardPin" ADD CONSTRAINT "BoardPin_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardPin" ADD CONSTRAINT "BoardPin_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
