/*
  Warnings:

  - You are about to drop the `Loto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Loto";

-- CreateTable
CREATE TABLE "Lotto" (
    "id" SERIAL NOT NULL,
    "numbers" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "bookNumber" INTEGER NOT NULL,

    CONSTRAINT "Lotto_pkey" PRIMARY KEY ("id")
);
