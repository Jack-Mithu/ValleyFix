-- CreateEnum
CREATE TYPE "TechnicianApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "technician_profiles" ADD COLUMN     "approval_status" "TechnicianApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "reviewed_at" TIMESTAMP(3),
ADD COLUMN     "reviewed_by_id" INTEGER;

-- CreateIndex
CREATE INDEX "technician_profiles_approval_status_idx" ON "technician_profiles"("approval_status");
