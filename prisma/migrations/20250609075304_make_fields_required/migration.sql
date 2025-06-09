/*
  Warnings:

  - Made the column `author` on table `document` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cloudinaryUrl` on table `document` required. This step will fail if there are existing NULL values in that column.
  - Made the column `publicationYear` on table `document` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `document` MODIFY `author` VARCHAR(191) NOT NULL,
    MODIFY `cloudinaryUrl` VARCHAR(191) NOT NULL,
    MODIFY `publicationYear` INTEGER NOT NULL;
