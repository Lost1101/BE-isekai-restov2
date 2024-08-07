/*
  Warnings:

  - Added the required column `waktu` to the `Menu` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `menu` ADD COLUMN `waktu` INTEGER NOT NULL;
