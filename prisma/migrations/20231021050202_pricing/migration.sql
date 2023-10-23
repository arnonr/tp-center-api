/*
  Warnings:

  - You are about to drop the column `pricing` on the `equipment_method` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `equipment_method` DROP COLUMN `pricing`,
    ADD COLUMN `price` INTEGER NULL;
