/*
  Warnings:

  - You are about to drop the column `project_id` on the `inspection` table. All the data in the column will be lost.
  - Added the required column `center_id` to the `inspection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `inspection` DROP FOREIGN KEY `inspection_project_id_fkey`;

-- AlterTable
ALTER TABLE `inspection` DROP COLUMN `project_id`,
    ADD COLUMN `center_id` INTEGER NOT NULL,
    ADD COLUMN `company_name` VARCHAR(500) NULL,
    ADD COLUMN `name` VARCHAR(500) NULL;

-- AddForeignKey
ALTER TABLE `inspection` ADD CONSTRAINT `inspection_center_id_fkey` FOREIGN KEY (`center_id`) REFERENCES `center`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
