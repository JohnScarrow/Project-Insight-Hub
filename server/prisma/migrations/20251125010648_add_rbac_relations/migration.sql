/*
  Warnings:

  - A unique constraint covering the columns `[userId,projectId]` on the table `RBAC` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RBAC_userId_projectId_key" ON "RBAC"("userId", "projectId");

-- AddForeignKey
ALTER TABLE "RBAC" ADD CONSTRAINT "RBAC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RBAC" ADD CONSTRAINT "RBAC_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
