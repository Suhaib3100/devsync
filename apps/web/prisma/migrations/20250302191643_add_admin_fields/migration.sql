-- AlterTable
ALTER TABLE "Secret" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Secret" ADD COLUMN "role" TEXT;