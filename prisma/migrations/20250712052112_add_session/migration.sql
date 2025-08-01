-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "scope" TEXT,
    "state" TEXT,
    "isOnline" BOOLEAN NOT NULL,
    "expires" DATETIME,
    "onlineAccessInfo" JSONB
);
