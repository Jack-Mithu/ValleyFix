-- CreateTable
CREATE TABLE "technician_availabilities" (
    "id" SERIAL NOT NULL,
    "technicianProfileId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technician_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_exceptions" (
    "id" SERIAL NOT NULL,
    "technicianProfileId" INTEGER NOT NULL,
    "exceptionDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technician_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "technician_availabilities_technicianProfileId_idx" ON "technician_availabilities"("technicianProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "technician_availabilities_technicianProfileId_dayOfWeek_sta_key" ON "technician_availabilities"("technicianProfileId", "dayOfWeek", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "technician_exceptions_technicianProfileId_idx" ON "technician_exceptions"("technicianProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "technician_exceptions_technicianProfileId_exceptionDate_sta_key" ON "technician_exceptions"("technicianProfileId", "exceptionDate", "startTime", "endTime");

-- AddForeignKey
ALTER TABLE "technician_availabilities" ADD CONSTRAINT "technician_availabilities_technicianProfileId_fkey" FOREIGN KEY ("technicianProfileId") REFERENCES "technician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_exceptions" ADD CONSTRAINT "technician_exceptions_technicianProfileId_fkey" FOREIGN KEY ("technicianProfileId") REFERENCES "technician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
