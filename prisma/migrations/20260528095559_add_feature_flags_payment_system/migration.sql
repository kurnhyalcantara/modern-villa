/*
  Warnings:

  - The `status` column on the `deposits` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `withdrawals` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WithdrawStatus" AS ENUM ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "FeatureFlagType" AS ENUM ('BOOLEAN', 'STRING', 'NUMBER');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('BANK_TRANSFER', 'E_WALLET');

-- AlterTable
ALTER TABLE "deposits" ADD COLUMN     "admin_note" TEXT,
ADD COLUMN     "evidence_url" TEXT,
ADD COLUMN     "receiver_account_id" TEXT,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "reviewed_by" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "DepositStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "withdrawals" ADD COLUMN     "admin_note" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "reviewed_by" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "WithdrawStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "value" TEXT NOT NULL,
    "type" "FeatureFlagType" NOT NULL DEFAULT 'BOOLEAN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_receiver_accounts" (
    "id" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "payment_type" "PaymentType" NOT NULL,
    "qr_image_url" TEXT,
    "instructions" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_receiver_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "feature_flags_key_idx" ON "feature_flags"("key");

-- CreateIndex
CREATE INDEX "feature_flags_is_active_idx" ON "feature_flags"("is_active");

-- CreateIndex
CREATE INDEX "payment_receiver_accounts_is_active_idx" ON "payment_receiver_accounts"("is_active");

-- CreateIndex
CREATE INDEX "payment_receiver_accounts_is_default_idx" ON "payment_receiver_accounts"("is_default");

-- CreateIndex
CREATE INDEX "deposits_status_idx" ON "deposits"("status");

-- CreateIndex
CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_receiver_account_id_fkey" FOREIGN KEY ("receiver_account_id") REFERENCES "payment_receiver_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
