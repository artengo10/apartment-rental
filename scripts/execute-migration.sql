-- Добавляем отсутствующие поля в apartments
ALTER TABLE "apartments" 
ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);

-- Меняем тип price с TEXT на INTEGER (если нужно)
-- ALTER TABLE "apartments" 
-- ALTER COLUMN "price" TYPE INTEGER USING (NULLIF(trim(price), '')::integer);

-- Создаем таблицу admins
CREATE TABLE IF NOT EXISTS "admins" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- Создаем уникальный индекс для email админа
CREATE UNIQUE INDEX IF NOT EXISTS "admins_email_key" ON "admins"("email");

-- Обновляем существующие квартиры - помечаем как APPROVED
UPDATE "apartments" SET "status" = 'APPROVED', "isPublished" = true WHERE "status" IS NULL;