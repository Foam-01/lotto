-- AlterTable
ALTER TABLE "BillSaleDetailIsBonus" ADD COLUMN     "bonusResultDetailId" INTEGER;

-- AddForeignKey
ALTER TABLE "BillSaleDetailIsBonus" ADD CONSTRAINT "BillSaleDetailIsBonus_bonusResultDetailId_fkey" FOREIGN KEY ("bonusResultDetailId") REFERENCES "BonusResultDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;
