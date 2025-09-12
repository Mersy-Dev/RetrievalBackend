/*
  Warnings:

  - You are about to drop the column `content` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `publicationYear` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `sourceUrl` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `document` table. All the data in the column will be lost.
  - Added the required column `description` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publishedYear` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `document` DROP COLUMN `content`,
    DROP COLUMN `publicationYear`,
    DROP COLUMN `sourceUrl`,
    DROP COLUMN `summary`,
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `publishedYear` INTEGER NOT NULL,
    ADD COLUMN `publisher` VARCHAR(191) NULL,
    ADD COLUMN `referenceLink` VARCHAR(191) NULL;
