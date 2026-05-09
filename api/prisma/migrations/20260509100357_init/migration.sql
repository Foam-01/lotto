-- CreateTable
CREATE TABLE "LottoIsBonus" (
    "id" SERIAL NOT NULL,
    "bonusResultDetailId" INTEGER NOT NULL,

    CONSTRAINT "LottoIsBonus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LottoIsBonus" ADD CONSTRAINT "LottoIsBonus_bonusResultDetailId_fkey" FOREIGN KEY ("bonusResultDetailId") REFERENCES "BonusResultDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
