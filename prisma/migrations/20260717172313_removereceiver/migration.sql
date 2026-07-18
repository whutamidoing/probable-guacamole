/*
  Warnings:

  - You are about to drop the column `receiverId` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[senderId,createdAt]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropIndex
DROP INDEX "Message_senderId_receiverId_createdAt_key";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "receiverId";

-- CreateIndex
CREATE UNIQUE INDEX "Message_senderId_createdAt_key" ON "Message"("senderId", "createdAt");
