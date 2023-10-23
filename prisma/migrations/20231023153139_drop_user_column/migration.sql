/*
  Warnings:

  - You are about to drop the column `created_equipment` on the `profile` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `profile` table. All the data in the column will be lost.
  - You are about to drop the column `created_equipment` on the `user` table. All the data in the column will be lost.
  - Added the required column `member_status` to the `profile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `profile` DROP COLUMN `created_equipment`,
    DROP COLUMN `status`,
    ADD COLUMN `contact_address` LONGTEXT NULL,
    ADD COLUMN `email` VARCHAR(500) NULL,
    ADD COLUMN `invoice_address` LONGTEXT NULL,
    ADD COLUMN `member_status` INTEGER NOT NULL,
    ADD COLUMN `organization` VARCHAR(500) NULL,
    ADD COLUMN `phone` VARCHAR(500) NULL,
    ADD COLUMN `tax_id` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `created_equipment`;
