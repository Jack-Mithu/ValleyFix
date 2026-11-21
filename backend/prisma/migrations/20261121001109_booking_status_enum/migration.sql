-- Booking status becomes an enum.
-- Prisma's default migration drops and recreates the column (losing data);
-- this version converts existing values in place instead, e.g. 'confirmed' -> 'CONFIRMED'.

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- bookings.status: text -> enum (keeps data)
ALTER TABLE "bookings"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "BookingStatus" USING (UPPER("status")::"BookingStatus"),
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "bookings"
  ADD COLUMN "cancellation_reason" TEXT,
  ADD COLUMN "cancelled_at" TIMESTAMP(3);

-- booking_status_history.status: text -> enum (keeps data)
ALTER TABLE "booking_status_history"
  ALTER COLUMN "status" TYPE "BookingStatus" USING (UPPER("status")::"BookingStatus");

ALTER TABLE "booking_status_history" ADD COLUMN "note" TEXT;

-- CreateIndex
CREATE INDEX "bookings_technicianProfileId_scheduledStart_idx" ON "bookings"("technicianProfileId", "scheduledStart");
