-- Performance: add indexes on foreign keys and columns used in WHERE / ORDER BY / GROUP BY
-- Postgres does not auto-create an index for a foreign key column, only for
-- primary keys and columns with a UNIQUE constraint, so these joins/filters
-- were doing full table scans without them.

-- CreateIndex
CREATE INDEX "Lotto_inSale_idx" ON "Lotto"("inSale");

-- CreateIndex
CREATE INDEX "Lotto_isCheckBonus_idx" ON "Lotto"("isCheckBonus");

-- CreateIndex
CREATE INDEX "Lotto_numbers_idx" ON "Lotto"("numbers");

-- CreateIndex
CREATE INDEX "BillSale_payDate_idx" ON "BillSale"("payDate");

-- CreateIndex
CREATE INDEX "BillSaleDetail_billSaleId_idx" ON "BillSaleDetail"("billSaleId");

-- CreateIndex
CREATE INDEX "BillSaleDetail_lottoId_idx" ON "BillSaleDetail"("lottoId");

-- CreateIndex
CREATE INDEX "BillSaleForSend_billSaleId_idx" ON "BillSaleForSend"("billSaleId");

-- CreateIndex
CREATE INDEX "BonusResultDetail_bonusDate_idx" ON "BonusResultDetail"("bonusDate");

-- CreateIndex
CREATE INDEX "BonusResultDetail_number_idx" ON "BonusResultDetail"("number");

-- CreateIndex
CREATE INDEX "BillSaleDetailIsBonus_billSaleDetailId_idx" ON "BillSaleDetailIsBonus"("billSaleDetailId");

-- CreateIndex
CREATE INDEX "BillSaleDetailIsBonus_bonusResultDetailId_idx" ON "BillSaleDetailIsBonus"("bonusResultDetailId");

-- CreateIndex
CREATE INDEX "LottoIsBonus_bonusResultDetailId_idx" ON "LottoIsBonus"("bonusResultDetailId");
