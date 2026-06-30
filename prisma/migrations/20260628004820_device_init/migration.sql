-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('PENDING', 'APPROVED', 'BLOCKED', 'REVOKED');

-- CreateEnum
CREATE TYPE "DeviceEvent" AS ENUM ('DEVICE_REGISTERED', 'DEVICE_APPROVED', 'DEVICE_BLOCKED', 'DEVICE_UNBLOCKED', 'DEVICE_REVOKED', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'REFRESH_TOKEN', 'SESSION_REVOKED', 'HEARTBEAT_RECEIVED', 'VERSION_UPDATED', 'SECRET_ROTATED');

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "displayName" TEXT,
    "deviceSecret" TEXT NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'PENDING',
    "serialNumber" TEXT,
    "macAddress" TEXT,
    "os" TEXT,
    "appVersion" TEXT,
    "companyId" TEXT,
    "lastSeen" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "blockedAt" TIMESTAMP(3),
    "blockedBy" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceSession" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "revokedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceLog" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "event" "DeviceEvent" NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeviceLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_deviceId_key" ON "Device"("deviceId");

-- CreateIndex
CREATE INDEX "Device_status_idx" ON "Device"("status");

-- CreateIndex
CREATE INDEX "Device_companyId_idx" ON "Device"("companyId");

-- CreateIndex
CREATE INDEX "Device_lastSeen_idx" ON "Device"("lastSeen");

-- CreateIndex
CREATE INDEX "Device_status_companyId_idx" ON "Device"("status", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSession_refreshToken_key" ON "DeviceSession"("refreshToken");

-- CreateIndex
CREATE INDEX "DeviceSession_deviceId_idx" ON "DeviceSession"("deviceId");

-- CreateIndex
CREATE INDEX "DeviceSession_expiresAt_idx" ON "DeviceSession"("expiresAt");

-- CreateIndex
CREATE INDEX "DeviceSession_deviceId_expiresAt_idx" ON "DeviceSession"("deviceId", "expiresAt");

-- CreateIndex
CREATE INDEX "DeviceSession_deviceId_revokedAt_idx" ON "DeviceSession"("deviceId", "revokedAt");

-- CreateIndex
CREATE INDEX "DeviceLog_deviceId_idx" ON "DeviceLog"("deviceId");

-- CreateIndex
CREATE INDEX "DeviceLog_event_idx" ON "DeviceLog"("event");

-- CreateIndex
CREATE INDEX "DeviceLog_createdAt_idx" ON "DeviceLog"("createdAt");

-- CreateIndex
CREATE INDEX "DeviceLog_deviceId_createdAt_idx" ON "DeviceLog"("deviceId", "createdAt");

-- CreateIndex
CREATE INDEX "DeviceLog_deviceId_event_idx" ON "DeviceLog"("deviceId", "event");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceSession" ADD CONSTRAINT "DeviceSession_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceLog" ADD CONSTRAINT "DeviceLog_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
