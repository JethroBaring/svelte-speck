/*
  Warnings:

  - You are about to drop the column `metadata` on the `test_step_results` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."test_step_results" DROP COLUMN "metadata";
