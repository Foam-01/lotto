-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loto" (
    "id" SERIAL NOT NULL,
    "numbers" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "bookNumber" INTEGER NOT NULL,

    CONSTRAINT "Loto_pkey" PRIMARY KEY ("id")
);
