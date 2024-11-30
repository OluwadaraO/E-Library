-- CreateTable
CREATE TABLE "GlobalNotificationRead" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "notificationId" INTEGER NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GlobalNotificationRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GlobalNotificationRead_userId_notificationId_key" ON "GlobalNotificationRead"("userId", "notificationId");

-- AddForeignKey
ALTER TABLE "GlobalNotificationRead" ADD CONSTRAINT "GlobalNotificationRead_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
