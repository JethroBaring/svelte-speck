import * as dotenv from "dotenv";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import websocketService from "../services/websocket.service";
import executionService from "../services/execution.service";

dotenv.config();

interface ExecutionJobData {
  testCaseRunId: string;
  testSuiteRunId: string;
  projectVariablesHash?: Record<string, any>;
  testSuiteVariablesHash?: Record<string, any>;
  projectFunctionsHash?: Record<string, any>;
  testSuiteFunctionsHash?: Record<string, any>;
  code: string;
  setupState?: any;
}

const connection = new IORedis({ maxRetriesPerRequest: null });

const worker = new Worker(
  "test-execution-queue",
  async (job) => {
    const { testCaseRunId, testSuiteRunId }: ExecutionJobData = job.data;

    try {
      await websocketService.notifyTestCaseStarted(
        testCaseRunId,
        testSuiteRunId
      );

      console.log(`Executing test case: ${testCaseRunId}`);
      console.log(`Job data:`, job.data);

      // Convert plain objects back to Maps for the execution service
      const projectVariablesMap = new Map(
        Object.entries(job.data.projectVariablesHash || {})
      );
      const testSuiteVariablesMap = new Map(
        Object.entries(job.data.testSuiteVariablesHash || {})
      );
      const projectFunctionsMap = new Map(
        Object.entries(job.data.projectFunctionsHash || {})
      );
      const testSuiteFunctionsMap = new Map(
        Object.entries(job.data.testSuiteFunctionsHash || {})
      );

      executionService.setVariables(projectVariablesMap, testSuiteVariablesMap);
      executionService.setFunctions(projectFunctionsMap, testSuiteFunctionsMap);
      const result = await executionService.executeTestCase(job.data);

      console.log(`Test case result:`, result);

      await websocketService.updateTestCaseResult(
        testCaseRunId,
        testSuiteRunId,
        result
      );

      return result;
    } catch (error) {
      await websocketService.updateTestCaseResult(
        testCaseRunId,
        testSuiteRunId,
        {
          success: false,
          error: (error as Error).message,
          duration: Date.now() - job.timestamp,
          results: [],
        }
      );
      throw error;
    }
  },
  {
    connection,
  }
);

worker.on("ready", () => {
  console.log(`🚀 Worker is ready and listening for jobs`);
});

worker.on("error", (err) => {
  console.error(`💥 Worker error:`, err);
});

worker.on("stalled", (jobId) => {
  console.warn(`⏰ Job ${jobId} stalled, will be retried`);
});

worker.on("completed", (job, result) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, (err as Error).message);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 Execution worker shutting down gracefully...");
  await worker.close();
  await connection.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 Execution worker shutting down gracefully...");
  await worker.close();
  await connection.disconnect();
  process.exit(0);
});
