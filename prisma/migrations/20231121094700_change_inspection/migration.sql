/*
  Warnings:

  - You are about to drop the column `inspection_type` on the `inspection` table. All the data in the column will be lost.
  - Added the required column `type` to the `inspection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inspection` DROP COLUMN `inspection_type`,
    ADD COLUMN `type` INTEGER NOT NULL;
