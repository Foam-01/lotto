/*
  Warnings:

  - You are about to drop the column `bonusDate` on the `BillSaleDetailIsBonus` table. All the data in the column will be lost.
  - You are about to drop the column `bonusPrice` on the `BillSaleDetailIsBonus` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `BillSaleDetailIsBonus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BillSaleDetailIsBonus" DROP COLUMN "bonusDate",
DROP COLUMN "bonusPrice",
DROP COLUMN "number";
