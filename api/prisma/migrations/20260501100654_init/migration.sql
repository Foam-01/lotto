/*
  Warnings:

  - You are about to drop the column `bonusResultId` on the `BonusResultDetail` table. All the data in the column will be lost.
  - You are about to drop the `BonusResult` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bonusDate` to the `BonusResultDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `BonusResultDetail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BonusResultDetail" DROP CONSTRAINT "BonusResultDetail_bonusResultId_fkey";

-- AlterTable
ALTER TABLE "BonusResultDetail" DROP COLUMN "bonusResultId",
ADD COLUMN     "bonusDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL;

-- DropTable
DROP TABLE "BonusResult";
