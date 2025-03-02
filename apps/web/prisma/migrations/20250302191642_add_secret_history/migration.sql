-- CreateTable
CREATE TABLE "SecretHistory" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "secretId" TEXT NOT NULL,

    CONSTRAINT "SecretHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SecretHistory" ADD CONSTRAINT "SecretHistory_secretId_fkey" FOREIGN KEY ("secretId") REFERENCES "Secret"("id") ON DELETE CASCADE ON UPDATE CASCADE;
