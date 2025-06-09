-- AlterTable
ALTER TABLE `document` ADD COLUMN `author` VARCHAR(191) NULL,
    ADD COLUMN `cloudinaryUrl` VARCHAR(191) NULL,
    ADD COLUMN `publicationYear` INTEGER NULL,
    ADD COLUMN `sourceUrl` VARCHAR(191) NULL;
