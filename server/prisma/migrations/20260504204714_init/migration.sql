-- CreateEnum
CREATE TYPE "TxnKind" AS ENUM ('DEPOSIT_TON_CRYPTOBOT', 'WITHDRAW_TON_CRYPTOBOT', 'STARS_PURCHASE_TON', 'STARS_PURCHASE_COSMETIC', 'STARS_PURCHASE_TICKET', 'TABLE_BUY_IN', 'TABLE_CASH_OUT', 'RAKE', 'TOURNAMENT_BUY_IN', 'TOURNAMENT_PAYOUT', 'REFERRAL_PAYOUT', 'VIP_RAKEBACK', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "TxnStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('SCHEDULED', 'REGISTERING', 'RUNNING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CosmeticCategory" AS ENUM ('AVATAR', 'CARD_BACK', 'TABLE_FELT', 'CHIP_SET', 'EMOJI');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "username" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "languageCode" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT,
    "countryCode" TEXT,
    "vipUntil" TIMESTAMP(3),
    "referredById" TEXT,
    "balanceTon" BIGINT NOT NULL DEFAULT 0,
    "lockedTon" BIGINT NOT NULL DEFAULT 0,
    "monthlyDepositTon" BIGINT NOT NULL DEFAULT 0,
    "monthlyResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "selfExcludedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "TxnKind" NOT NULL,
    "amountTon" BIGINT NOT NULL,
    "amountStars" BIGINT,
    "externalId" TEXT,
    "status" "TxnStatus" NOT NULL DEFAULT 'PENDING',
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hand" (
    "id" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "community" JSONB NOT NULL,
    "potTon" BIGINT NOT NULL DEFAULT 0,
    "rakeTon" BIGINT NOT NULL DEFAULT 0,
    "seedCommitment" TEXT NOT NULL,
    "seedRevealed" TEXT,

    CONSTRAINT "Hand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandSeat" (
    "id" TEXT NOT NULL,
    "handId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seatIndex" INTEGER NOT NULL,
    "holeCards" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "netTon" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "HandSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "buyInTon" BIGINT NOT NULL,
    "feeTon" BIGINT NOT NULL,
    "buyInStars" BIGINT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "registeredAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "status" "TournamentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "maxPlayers" INTEGER NOT NULL,
    "payoutStructure" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentEntry" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishPlace" INTEGER,
    "payoutTon" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "TournamentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CosmeticItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "CosmeticCategory" NOT NULL,
    "priceStars" BIGINT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CosmeticItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cosmetic" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equipped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cosmetic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Transaction_externalId_idx" ON "Transaction"("externalId");

-- CreateIndex
CREATE INDEX "HandSeat_userId_handId_idx" ON "HandSeat"("userId", "handId");

-- CreateIndex
CREATE UNIQUE INDEX "HandSeat_handId_seatIndex_key" ON "HandSeat"("handId", "seatIndex");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentEntry_tournamentId_userId_key" ON "TournamentEntry"("tournamentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Cosmetic_userId_itemId_key" ON "Cosmetic"("userId", "itemId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandSeat" ADD CONSTRAINT "HandSeat_handId_fkey" FOREIGN KEY ("handId") REFERENCES "Hand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandSeat" ADD CONSTRAINT "HandSeat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentEntry" ADD CONSTRAINT "TournamentEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cosmetic" ADD CONSTRAINT "Cosmetic_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
