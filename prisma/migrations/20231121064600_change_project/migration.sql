/*
  Warnings:

  - You are about to alter the column `budget` on the `project` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `Double`.

*/
-- AlterTable
ALTER TABLE `project` MODIFY `budget` DOUBLE NULL,
    MODIFY `trl` INTEGER NULL,
    MODIFY `project_date` DATE NULL;
