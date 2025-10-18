-- CreateEnum
CREATE TYPE "public"."StepContextType" AS ENUM ('NONE', 'LOOP', 'FOREACH', 'CONDITIONAL', 'FUNCTION', 'CALL');

-- AlterTable
ALTER TABLE "public"."test_step_results" ADD COLUMN     "contextName" TEXT,
ADD COLUMN     "contextType" "public"."StepContextType" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "iteration" INTEGER,
ADD COLUMN     "line_number" INTEGER,
ADD COLUMN     "metadata" JSON,
ADD COLUMN     "parent_step_result_id" TEXT,
ADD COLUMN     "stmt_type" TEXT,
ALTER COLUMN "step_name" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."test_step_results" ADD CONSTRAINT "test_step_results_parent_step_result_id_fkey" FOREIGN KEY ("parent_step_result_id") REFERENCES "public"."test_step_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;
