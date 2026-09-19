-- CreateTable
CREATE TABLE "technician_services" (
    "id" SERIAL NOT NULL,
    "technicianProfileId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technician_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_service_areas" (
    "id" SERIAL NOT NULL,
    "technicianProfileId" INTEGER NOT NULL,
    "serviceAreaId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technician_service_areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "technician_services_technicianProfileId_idx" ON "technician_services"("technicianProfileId");

-- CreateIndex
CREATE INDEX "technician_services_serviceId_idx" ON "technician_services"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "technician_services_technicianProfileId_serviceId_key" ON "technician_services"("technicianProfileId", "serviceId");

-- CreateIndex
CREATE INDEX "technician_service_areas_technicianProfileId_idx" ON "technician_service_areas"("technicianProfileId");

-- CreateIndex
CREATE INDEX "technician_service_areas_serviceAreaId_idx" ON "technician_service_areas"("serviceAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "technician_service_areas_technicianProfileId_serviceAreaId_key" ON "technician_service_areas"("technicianProfileId", "serviceAreaId");

-- AddForeignKey
ALTER TABLE "technician_services" ADD CONSTRAINT "technician_services_technicianProfileId_fkey" FOREIGN KEY ("technicianProfileId") REFERENCES "technician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_services" ADD CONSTRAINT "technician_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_service_areas" ADD CONSTRAINT "technician_service_areas_technicianProfileId_fkey" FOREIGN KEY ("technicianProfileId") REFERENCES "technician_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_service_areas" ADD CONSTRAINT "technician_service_areas_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "service_areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
