-- DropForeignKey
ALTER TABLE `inspection` DROP FOREIGN KEY `inspection_project_id_fkey`;

-- AddForeignKey
ALTER TABLE `inspection` ADD CONSTRAINT `inspection_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
