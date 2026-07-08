-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('ACTIVE', 'PROCESS_INACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keycard" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "status" "CardStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "Keycard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_number_key" ON "Room"("number");

-- CreateIndex
CREATE INDEX "Keycard_roomId_idx" ON "Keycard"("roomId");

-- CreateIndex
CREATE INDEX "Keycard_code_idx" ON "Keycard"("code");

-- AddForeignKey
ALTER TABLE "Keycard" ADD CONSTRAINT "Keycard_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
