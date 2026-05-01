-- CreateTable
CREATE TABLE "BillSaleForSend" (
    "id" SERIAL NOT NULL,
    "billSaleId" INTEGER NOT NULL,
    "sendName" TEXT,
    "sendDate" TIMESTAMP(3) NOT NULL,
    "sendTime" TEXT NOT NULL,
    "traceCode" TEXT NOT NULL,
    "sendPlatform" TEXT NOT NULL,
    "remark" TEXT,
    "price" INTEGER NOT NULL,

    CONSTRAINT "BillSaleForSend_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BillSaleForSend" ADD CONSTRAINT "BillSaleForSend_billSaleId_fkey" FOREIGN KEY ("billSaleId") REFERENCES "BillSale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
