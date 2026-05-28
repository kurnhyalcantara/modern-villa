-- CreateTable
CREATE TABLE "languages" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "native_name" TEXT NOT NULL,
    "flag_icon" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_keys" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "translation_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "translation_values" (
    "id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,
    "translation_key_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "languages_code_key" ON "languages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "translation_keys_key_key" ON "translation_keys"("key");

-- CreateIndex
CREATE INDEX "translation_keys_key_idx" ON "translation_keys"("key");

-- CreateIndex
CREATE INDEX "translation_values_language_id_idx" ON "translation_values"("language_id");

-- CreateIndex
CREATE INDEX "translation_values_translation_key_id_idx" ON "translation_values"("translation_key_id");

-- CreateIndex
CREATE UNIQUE INDEX "translation_values_language_id_translation_key_id_key" ON "translation_values"("language_id", "translation_key_id");

-- AddForeignKey
ALTER TABLE "translation_values" ADD CONSTRAINT "translation_values_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "translation_values" ADD CONSTRAINT "translation_values_translation_key_id_fkey" FOREIGN KEY ("translation_key_id") REFERENCES "translation_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;
