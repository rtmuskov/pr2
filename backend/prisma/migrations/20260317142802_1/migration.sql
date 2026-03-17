DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'GameCase'
    ) THEN
        ALTER TABLE "GameCase" ALTER COLUMN "topics" DROP DEFAULT;
    END IF;
END $$;
