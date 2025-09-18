/*
  Warnings:

  - You are about to drop the column `en_text` on the `translation` table. All the data in the column will be lost.
  - You are about to drop the column `yo_text` on the `translation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key,locale]` on the table `Translation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `locale` to the `Translation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Translation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Translation_key_key` ON `translation`;

-- AlterTable
ALTER TABLE `translation` DROP COLUMN `en_text`,
    DROP COLUMN `yo_text`,
    ADD COLUMN `locale` VARCHAR(191) NOT NULL,
    ADD COLUMN `value` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Translation_key_locale_key` ON `Translation`(`key`, `locale`);
