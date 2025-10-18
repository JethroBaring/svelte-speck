import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import databaseService from '../services/database.service';
import * as dotenv from 'dotenv';
dotenv.config();

interface DatabaseJobData {
  type: string;
  testCaseRunId: string;
  testSuiteRunId: string;
  startedAt?: string;
  result?: any;
}

const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || "0"),
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "database-updates-queue",
  async (job) => {
    const { type, testCaseRunId, testSuiteRunId, startedAt, result }: DatabaseJobData = job.data;

    console.log(
      `🗄️ Processing database update: ${type} for test case ${testCaseRunId}`
    );

    try {
      switch (type) {
        case "update-test-case-started":
          await databaseService.updateTestCaseStarted(testCaseRunId);
          console.log(
            `✅ Updated test case ${testCaseRunId} status to RUNNING`
          );
          break;

        case "update-test-case-completed":
          await databaseService.updateTestCaseCompleted(testCaseRunId, result);
          console.log(
            `✅ Updated test case ${testCaseRunId} with final result: ${result.status}`
          );
          break;

        default:
          throw new Error(`Unknown database update type: ${type}`);
      }

      return { success: true, type, testCaseRunId };
    } catch (error) {
      console.log(error);
      console.error(
        `❌ Database update failed for ${testCaseRunId}:`,
        (error as Error).message
      );
      throw error; // BullMQ will handle retry logic
    }
  },
  {
    connection,
    concurrency: 5, // Process up to 5 database updates concurrently
  }
);

worker.on("ready", () => {
  console.log(
    `🗄️ Database worker is ready and listening for database update jobs`
  );
});

worker.on("error", (err) => {
  console.error(`💥 Database worker error:`, err);
});

worker.on("completed", (job, result) => {
  console.log(
    `✅ Database job ${job.id} completed: ${result.type} for ${result.testCaseRunId}`
  );
});

worker.on("failed", (job, err) => {
  console.error(`❌ Database job ${job?.id || 'unknown'} failed:`, (err as Error).message);
  console.error(`Job data:`, job?.data);
});
  
worker.on("stalled", (job: any) => {
  const jobId = typeof job === 'string' ? job : job?.id || 'unknown';
  console.warn(`⏰ Database job ${jobId} stalled, will be retried`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 Database worker shutting down gracefully...");
  await worker.close();
  await connection.disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 Database worker shutting down gracefully...");
  await worker.close();
  await connection.disconnect();
  process.exit(0);
});
