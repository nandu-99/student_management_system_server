/*
  Warnings:

  - You are about to drop the column `contact_number` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `parent` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[enrollmentId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `enrollmentId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Student` DROP COLUMN `contact_number`,
    DROP COLUMN `parent`,
    ADD COLUMN `contactNumber` VARCHAR(191) NULL,
    ADD COLUMN `enrollmentId` INTEGER NOT NULL,
    ADD COLUMN `parentName` VARCHAR(191) NULL,
    ADD COLUMN `school` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Student_enrollmentId_key` ON `Student`(`enrollmentId`);
