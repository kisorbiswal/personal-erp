-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Event_workspaceId_deletedAt_idx" ON "Event"("workspaceId", "deletedAt");
