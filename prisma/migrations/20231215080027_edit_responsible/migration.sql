/*
  Warnings:

  - You are about to drop the column `responsible_email` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `responsible_phone` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `responsible_staff` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `center` ADD COLUMN `responsible_email` VARCHAR(500) NULL,
    ADD COLUMN `responsible_phone` VARCHAR(500) NULL,
    ADD COLUMN `responsible_staff` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `responsible_email`,
    DROP COLUMN `responsible_phone`,
    DROP COLUMN `responsible_staff`;
