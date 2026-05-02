-- AlterTable
ALTER TABLE "BillSale" ADD COLUMN     "deliverDate" TIMESTAMP(3),
ADD COLUMN     "price" INTEGER,
ADD COLUMN     "tranferMoneyDate" TIMESTAMP(3),
ADD COLUMN     "tranferMoneyTime" TEXT;

-- CreateTable
CREATE TABLE "BillSaleDetailIsBonus" (
    "id" SERIAL NOT NULL,
    "billSaleDetailId" INTEGER NOT NULL,
    "bonusPrice" INTEGER NOT NULL,
    "bonusDate" TIMESTAMP(3) NOT NULL,
    "number" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "BillSaleDetailIsBonus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BillSaleDetailIsBonus" ADD CONSTRAINT "BillSaleDetailIsBonus_billSaleDetailId_fkey" FOREIGN KEY ("billSaleDetailId") REFERENCES "BillSaleDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
