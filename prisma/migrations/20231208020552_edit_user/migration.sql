-- AlterTable
ALTER TABLE `user` ADD COLUMN `center_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_center_id_fkey` FOREIGN KEY (`center_id`) REFERENCES `center`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
