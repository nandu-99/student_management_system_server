-- AlterTable
ALTER TABLE `Admin` ADD COLUMN `address` VARCHAR(191) NULL,
    ADD COLUMN `contact_number` VARCHAR(191) NULL,
    ADD COLUMN `dob` DATETIME(3) NULL,
    ADD COLUMN `profile_image` VARCHAR(191) NULL;
