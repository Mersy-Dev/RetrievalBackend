/*
  Warnings:

  - You are about to drop the column `cloudinaryUrl` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `firebaseUrl` on the `document` table. All the data in the column will be lost.
  - Added the required column `storageUrl` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `document` DROP COLUMN `cloudinaryUrl`,
    DROP COLUMN `firebaseUrl`,
    ADD COLUMN `storageUrl` VARCHAR(191) NOT NULL;
