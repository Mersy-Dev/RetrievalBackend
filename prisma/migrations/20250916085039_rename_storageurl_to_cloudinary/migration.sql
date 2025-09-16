/*
  Warnings:

  - You are about to drop the column `storageUrl` on the `document` table. All the data in the column will be lost.
  - Added the required column `cloudinaryUrl` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `document` DROP COLUMN `storageUrl`,
    ADD COLUMN `cloudinaryUrl` VARCHAR(191) NOT NULL;
