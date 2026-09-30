-- Fix: schema.prisma declares Lotto.inSale and Lotto.isCheckBonus as Boolean,
-- but the live database still has them as INTEGER (from the original migrations
-- 20260506075145_init and 20260502111501_init). No migration ever converted the
-- column type, so every query using a boolean literal against these columns
-- fails at the database level (500 Internal Server Error on /api/lotto/lottoIsBonus
-- and /api/bonus/checkBonus, and likely other Lotto queries touching these fields).
--
-- Safe conversion: 0 -> false, any non-zero -> true (matches existing app logic,
-- which only ever wrote 0 or 1 into these columns). No rows are dropped.
--
-- Guarded: this migration was first applied via `prisma db push` (which
-- doesn't record migration history) before the project switched to
-- `prisma migrate deploy`, so on a re-run these columns may already be
-- BOOLEAN — casting a BOOLEAN column with `<> 0` would then fail with
-- "operator does not exist: boolean <> integer". Only convert if still INTEGER.
DO $$
BEGIN
  IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'Lotto' AND column_name = 'isCheckBonus') = 'integer' THEN
    ALTER TABLE "Lotto"
      ALTER COLUMN "isCheckBonus" DROP DEFAULT,
      ALTER COLUMN "isCheckBonus" TYPE BOOLEAN USING ("isCheckBonus" <> 0),
      ALTER COLUMN "isCheckBonus" SET DEFAULT false;
  END IF;

  IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'Lotto' AND column_name = 'inSale') = 'integer' THEN
    ALTER TABLE "Lotto"
      ALTER COLUMN "inSale" DROP DEFAULT,
      ALTER COLUMN "inSale" TYPE BOOLEAN USING ("inSale" <> 0),
      ALTER COLUMN "inSale" SET DEFAULT false;
  END IF;
END $$;
