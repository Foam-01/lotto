-- Performance: add indexes on foreign keys and columns used in WHERE / ORDER BY / GROUP BY
-- Postgres does not auto-create an index for a foreign key column, only for
-- primary keys and columns with a UNIQUE constraint, so these joins/filters
-- were doing full table scans without them.

-- CreateIndex
-- IF NOT EXISTS on every index below: this migration was first applied piecemeal
-- via `prisma db push` (which doesn't record migration history) before the
-- project switched to `prisma migrate deploy`, so some of these already exist
-- on production while others don't — plain CREATE INDEX would fail with
-- "already exists" on a re-run otherwise.
CREATE INDEX IF NOT EXISTS "Lotto_inSale_idx" ON "Lotto"("inSale");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lotto_isCheckBonus_idx" ON "Lotto"("isCheckBonus");

-- CreateIndex
-- Helps SearchLottoDto position="start" (numbers LIKE 'xxx%'). A plain
-- B-tree index cannot accelerate position="end" (numbers LIKE '%xxx') --
-- that would need a trigram (pg_trgm) index, which we are not adding
-- without confirming how often that search path is actually used.
CREATE INDEX IF NOT EXISTS "Lotto_numbers_idx" ON "Lotto"("numbers");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BillSale_payDate_idx" ON "BillSale"("payDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BillSaleDetail_billSaleId_idx" ON "BillSaleDetail"("billSaleId");

-- CreateIndex
-- A physical lotto ticket can only be linked to one BillSaleDetail at a time
-- (removeBill() hard-deletes the row when a bill is cancelled, releasing the
-- ticket back to stock), so lottoId should never repeat. Enforced at the DB
-- level to close the race condition in confirmBuy() where two concurrent
-- requests could otherwise both pass its application-level "not already
-- reserved" check before either INSERT commits.
--
-- SAFETY CHECK: this migration was written without a live database
-- connection, so duplicate lottoId rows could not be ruled out ahead of
-- time. The DO block below fails the migration with a clear error instead
-- of a cryptic unique-violation if any already exist. To check yourself
-- before deploying:
--   SELECT "lottoId", COUNT(*) FROM "BillSaleDetail" GROUP BY "lottoId" HAVING COUNT(*) > 1;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "BillSaleDetail" GROUP BY "lottoId" HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add unique constraint on BillSaleDetail.lottoId: duplicate lottoId rows already exist. Resolve them manually (decide which BillSaleDetail per lottoId is the valid one, delete/reassign the rest) before re-running this migration.';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "BillSaleDetail_lottoId_key" ON "BillSaleDetail"("lottoId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BillSaleForSend_billSaleId_idx" ON "BillSaleForSend"("billSaleId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BonusResultDetail_bonusDate_idx" ON "BonusResultDetail"("bonusDate");

-- CreateIndex
-- Data integrity: prevents the same billSaleDetail from being recorded as a
-- winner of the same bonus result twice (checkBonus() previously relied on
-- an application-level check-then-insert, which is not safe if the endpoint
-- is called twice concurrently). This also makes the leftover
-- BillSaleDetailIsBonus_billSaleDetailId_idx redundant, since a composite
-- unique index already serves lookups on its leftmost column.
--
-- Existing duplicate (billSaleDetailId, bonusResultDetailId) pairs would make
-- CREATE UNIQUE INDEX fail with a P2002-style unique-violation, so dedupe
-- first: keep the earliest row (lowest id, i.e. the original "ตรวจรางวัล"
-- record) per pair and drop the later duplicate(s). NULL bonusResultDetailId
-- rows are left untouched — Postgres treats NULLs as distinct in a unique
-- index, so they were never actually in conflict.
DELETE FROM "BillSaleDetailIsBonus" a USING "BillSaleDetailIsBonus" b
WHERE a."bonusResultDetailId" IS NOT NULL
  AND a."billSaleDetailId" = b."billSaleDetailId"
  AND a."bonusResultDetailId" = b."bonusResultDetailId"
  AND a.id > b.id;

CREATE UNIQUE INDEX IF NOT EXISTS "BillSaleDetailIsBonus_billSaleDetailId_bonusResultDetailId_key" ON "BillSaleDetailIsBonus"("billSaleDetailId", "bonusResultDetailId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BillSaleDetailIsBonus_bonusResultDetailId_idx" ON "BillSaleDetailIsBonus"("bonusResultDetailId");

-- CreateIndex
-- Data integrity: enforces "one row per winning bonus result" at the DB
-- level instead of only via an application-level findFirst-then-create
-- check (same race-condition class as above).
CREATE UNIQUE INDEX IF NOT EXISTS "LottoIsBonus_bonusResultDetailId_key" ON "LottoIsBonus"("bonusResultDetailId");
