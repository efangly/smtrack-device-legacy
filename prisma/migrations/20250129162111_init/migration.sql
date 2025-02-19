-- CreateTable
CREATE TABLE "Devices" (
    "id" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "hospital" TEXT NOT NULL,
    "sn" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "maxTemp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minTemp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "adjTemp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "record" INTEGER NOT NULL DEFAULT 0,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempLogs" (
    "id" TEXT NOT NULL,
    "mcuId" TEXT NOT NULL,
    "internet" BOOLEAN NOT NULL DEFAULT false,
    "door" BOOLEAN NOT NULL DEFAULT false,
    "plugin" BOOLEAN NOT NULL DEFAULT false,
    "tempValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "realValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" TEXT,
    "time" TEXT,
    "isAlert" BOOLEAN NOT NULL DEFAULT false,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TempLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Devices_sn_key" ON "Devices"("sn");

-- CreateIndex
CREATE UNIQUE INDEX "Devices_seq_key" ON "Devices"("seq");

-- AddForeignKey
ALTER TABLE "TempLogs" ADD CONSTRAINT "TempLogs_mcuId_fkey" FOREIGN KEY ("mcuId") REFERENCES "Devices"("sn") ON DELETE RESTRICT ON UPDATE CASCADE;
