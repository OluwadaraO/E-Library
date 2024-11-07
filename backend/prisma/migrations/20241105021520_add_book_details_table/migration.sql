-- CreateTable
CREATE TABLE "BookDetails" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookDetails_bookId_key" ON "BookDetails"("bookId");

-- AddForeignKey
ALTER TABLE "BookDetails" ADD CONSTRAINT "BookDetails_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
