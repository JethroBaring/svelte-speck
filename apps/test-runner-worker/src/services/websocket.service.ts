import IORedis, { RedisOptions } from "ioredis";
import { Queue } from "bullmq";
import * as dotenv from 'dotenv';

dotenv.config();

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
}

interface TestStepResult {
  status?: string;
  error?: string;
  screenshotUrl?: string;
}

interface TestCaseResult {
  success: boolean;
  results: any[];
  duration: number;
  error?: string;
}

interface DatabaseUpdateJob {
  type: string;
  testCaseRunId: string;
  testSuiteRunId: string;
  startedAt?: string;
  result?: any;
}

class WebsocketService {
  private baseUrl: string;
  private redis: IORedis;
  private databaseQueue: Queue;

  constructor() {
    this.baseUrl = process.env.MAIN_API_URL || "http://localhost:3000";
    this.redis = new IORedis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || "0"),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    } as RedisOptions);

    // BullMQ queue for database updates
    this.databaseQueue = new Queue("database-updates-queue", {
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || "0"),
      },
    });
  }

  private async _request(
    path: string,
    { method = "GET", body }: RequestOptions = {}
  ): Promise<any> {
    const url = `${this.baseUrl}/test-runner${path}`;
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.WORKER_API_KEY || "",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const message =
        data?.message || `Request failed: ${res.status} ${res.statusText}`;
      const err = new Error(message) as Error & { status: number; data: any };
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  async notifyTestCaseStarted(
    testCaseRunId: string,
    testSuiteRunId: string
  ): Promise<void> {
    const timestamp = new Date().toISOString();

    // Immediate WebSocket notification for UI
    await this.redis.publish(
      "test-case-events",
      JSON.stringify({
        type: "test-case-started",
        testSuiteRunId,
        testCaseRunId,
        data: {
          status: "RUNNING",
        },
        timestamp,
      })
    );

    // Reliable database update via BullMQ
    await this.databaseQueue.add(
      "update-test-case-started",
      {
        type: "update-test-case-started",
        testCaseRunId,
        testSuiteRunId,
        startedAt: timestamp,
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
      }
    );
  }

  async updateTestCaseResult(
    testCaseRunId: string,
    testSuiteRunId: string,
    result: TestCaseResult
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    // Immediate WebSocket notification for UI
    await this.redis.publish(
      "test-case-events",
      JSON.stringify({
        type: "test-case-completed",
        testSuiteRunId,
        testCaseRunId,
        data: {
          status: result.results.every((result) => result.status === "PASSED")
            ? "PASSED"
            : "FAILED",
          duration: result.duration,
          error: result.error,
        },
        timestamp,
      })
    );

    // Reliable database update via BullMQ
    await this.databaseQueue.add(
      "update-test-case-completed",
      {
        type: "update-test-case-completed",
        testCaseRunId,
        testSuiteRunId,
        result: {
          status: result.success ? "PASSED" : "FAILED",
          duration: result.duration,
          errorMessage: result.error,
          results: result.results,
        },
      },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
      }
    );
  }

  async notifyTestStepStarted(
    testCaseRunId: string,
    testSuiteRunId: string,
    stepResult: any
  ): Promise<void> {
    console.log('🔌 Websocket service received stepResult:', JSON.stringify(stepResult, null, 2));
    
    // Publish directly to Redis instead of API endpoint
    const event = {
      type: "test-step-started",
      testSuiteRunId,
      testCaseRunId,
      data: {
        testStep: stepResult,
      },
      timestamp: new Date().toISOString(),
    };

    console.log('📡 Publishing event to Redis:', JSON.stringify(event, null, 2));
    await this.redis.publish("test-step-events", JSON.stringify(event));
  }

  async notifyTestStepCompleted(
    testCaseRunId: string,
    testSuiteRunId: string,
    stepNumber: number,
    result: TestStepResult,
    screenshotUrl?: string
  ): Promise<void> {
    // Publish directly to Redis instead of API endpoint
    const event = {
      type: "test-step-completed",
      testSuiteRunId,
      testCaseRunId,
      data: {
        stepNumber,
        status: result?.error ? "FAILED" : "PASSED",
        error: result?.error || null,
        screenshotUrl,
      },
      timestamp: new Date().toISOString(),
    };

    console.log("HANNAH I LOVE YOU 3", event);

    await this.redis.publish("test-step-events", JSON.stringify(event));
  }

  async notifySetupCompleted(
    testSuiteRunId: string,
    cacheKey: string,
    setupData: any
  ): Promise<any> {
    return this._request("/worker/setup-completed", {
      method: "POST",
      body: { testSuiteRunId, cacheKey, setupData },
    });
  }

  async notifySetupFailed(
    testSuiteRunId: string,
    cacheKey: string,
    error: string
  ): Promise<any> {
    return this._request("/worker/setup-failed", {
      method: "POST",
      body: { testSuiteRunId, cacheKey, error },
    });
  }
}

export default new WebsocketService();
