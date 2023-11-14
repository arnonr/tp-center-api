-- CreateTable
CREATE TABLE `bill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_company_id` INTEGER NOT NULL,
    `send_name` VARCHAR(500) NULL,
    `send_date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `receive_name` VARCHAR(500) NULL,
    `receive_address` VARCHAR(500) NULL,
    `tracking_id` VARCHAR(500) NULL,
    `weight` VARCHAR(500) NULL,
    `price` INTEGER NULL,
    `is_active` INTEGER NOT NULL DEFAULT 1,
    `is_publish` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` VARCHAR(255) NULL,
    `updated_at` DATETIME(3) NULL,
    `updated_by` VARCHAR(255) NULL,
    `deleted_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
