/*
  Warnings:

  - You are about to drop the `BookDetails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BookDetails" DROP CONSTRAINT "BookDetails_bookId_fkey";

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "description" TEXT;

-- DropTable
DROP TABLE "BookDetails";
