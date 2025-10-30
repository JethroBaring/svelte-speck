/*
  Warnings:

  - Made the column `code` on table `test_case_runs` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."test_case_runs" ALTER COLUMN "code" SET NOT NULL;
