-- CreateTable
CREATE TABLE "Secret" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "password" TEXT,
    "expiryTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Secret_pkey" PRIMARY KEY ("id")
);
