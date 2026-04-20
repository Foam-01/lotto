/*
  Warnings:

  - Added the required column `cost` to the `Lotto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sale` to the `Lotto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lotto" ADD COLUMN     "cost" INTEGER NOT NULL,
ADD COLUMN     "sale" INTEGER NOT NULL;
