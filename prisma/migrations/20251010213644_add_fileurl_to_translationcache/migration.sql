-- AlterTable
ALTER TABLE `translationcache` ADD COLUMN `fileUrl` VARCHAR(191) NULL,
    MODIFY `translated` VARCHAR(191) NULL;
