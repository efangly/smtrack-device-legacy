/*
  Warnings:

  - You are about to drop the column `insertedAt` on the `Devices` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Devices" DROP COLUMN "insertedAt",
ADD COLUMN     "serial" TEXT;
