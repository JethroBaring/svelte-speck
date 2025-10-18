/*
  Warnings:

  - You are about to drop the column `contextName` on the `test_step_results` table. All the data in the column will be lost.
  - You are about to drop the column `contextType` on the `test_step_results` table. All the data in the column will be lost.
  - You are about to drop the column `iteration` on the `test_step_results` table. All the data in the column will be lost.
  - You are about to drop the column `line_number` on the `test_step_results` table. All the data in the column will be lost.
  - You are about to drop the column `parent_step_result_id` on the `test_step_results` table. All the data in the column will be lost.
  - Made the column `step_name` on table `test_step_results` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stmt_type` on table `test_step_results` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."test_step_results" DROP CONSTRAINT "test_step_results_parent_step_result_id_fkey";

-- AlterTable
ALTER TABLE "public"."test_step_results" DROP COLUMN "contextName",
DROP COLUMN "contextType",
DROP COLUMN "iteration",
DROP COLUMN "line_number",
DROP COLUMN "parent_step_result_id",
ADD COLUMN     "context_type" TEXT,
ADD COLUMN     "meta" JSONB,
ADD COLUMN     "parent_step_id" TEXT,
ALTER COLUMN "step_name" SET NOT NULL,
ALTER COLUMN "stmt_type" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."test_step_results" ADD CONSTRAINT "test_step_results_parent_step_id_fkey" FOREIGN KEY ("parent_step_id") REFERENCES "public"."test_step_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
