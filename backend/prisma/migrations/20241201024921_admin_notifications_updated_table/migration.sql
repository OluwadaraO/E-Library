-- CreateTable
CREATE TABLE "AdminNotification" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "adminId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
