// src/test-runner/enhanced-test-queue.service.ts
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { TestSuiteRunsEventsService } from './test-suite-runs-events.service';
import {
  TestSuiteRunStatus,
  TestCaseRunStatus,
  TestStepStatus,
} from '@repo/types/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

export interface TestSuiteQueueData {
  testSuiteRunId: string;
  testSuiteId: string;
  environment: string;
  browser: string;
  version?: string;
}

export interface TestCaseQueueData {
  testCaseRunId: string;
  testCaseId: string;
  testSuiteRunId: string;
  testSuiteId: string;
  setupCacheKey?: string;
  retryAttempt?: number;
  code?: string;
  projectVariablesHash?: Record<string, string>;
  testSuiteVariablesHash?: Record<string, string>;
  projectFunctionsHash?: Record<string, string>;
  testSuiteFunctionsHash?: Record<string, string>;
}

export interface SetupQueueData {
  testSuiteId: string;
  testSuiteRunId: string;
  environment: string;
  browser: string;
  cacheKey: string;
}

@Injectable()
export class TestSuiteRunsService {
  private readonly logger = new Logger(TestSuiteRunsService.name);
  private jobTracker = new Map<string, string[]>(); // testSuiteRunId -> [jobIds]

  constructor(
    @InjectQueue('test-setup-queue') private setupQueue: Queue<SetupQueueData>,
    @InjectQueue('test-execution-queue')
    private executionQueue: Queue<TestCaseQueueData>,
    private prisma: PrismaService,
    private testEventsService: TestSuiteRunsEventsService,
  ) {}

  async runTestSuite(testSuiteId: string) {
    const lockKey = `test-suite:run-lock:${testSuiteId}`;
    const acquired = await this.testEventsService.acquireLock(lockKey, 60 * 60); // 1 hour TTL
    if (!acquired) {
      throw new ConflictException('Test suite already running');
    }
    // 1. Create test suite run
    const testSuiteRun = await this.prisma.testSuiteRun.create({
      data: {
        testSuiteId,
        status: TestSuiteRunStatus.RUNNING,
      },
    });

    const testSuite = await this.prisma.testSuites.findUnique({
      where: { id: testSuiteId },
      select: {
        projectId: true,
      },
    });

    // Emit suite started event
    await this.testEventsService.publishTestSuiteEvent({
      type: 'test-suite-started',
      testSuiteRunId: testSuiteRun.id,
      data: {
        status: TestSuiteRunStatus.RUNNING,
        environment: 'production',
        browser: 'chrome',
      },
      timestamp: new Date().toISOString(),
    });

    try {
      // 2. Get all test cases under that test suite
      const testCases = await this.prisma.testCase.findMany({
        where: { testSuiteId },
        orderBy: { createdAt: 'asc' },
      });

      if (testCases.length === 0) {
        await this.prisma.testSuiteRun.update({
          where: { id: testSuiteRun.id },
          data: {
            status: TestSuiteRunStatus.FAILED,
            completedAt: new Date(),
          },
        });
        await this.testEventsService.releaseLock(lockKey);
        return {
          testSuiteRunId: testSuiteRun.id,
          totalTestCases: 0,
          testCaseRuns: [],
          message: 'No test cases to execute',
        };
      }

      // 3. Create test case runs for all test cases
      const testCaseRuns = await Promise.all(
        testCases.map((testCase) =>
          this.prisma.testCaseRun.create({
            data: {
              testCaseId: testCase.id,
              testSuiteRunId: testSuiteRun.id,
              status: TestCaseRunStatus.PENDING,
            },
            include: {
              testCase: true,
            },
          }),
        ),
      );

      // Update total tests count
      await this.prisma.testSuiteRun.update({
        where: { id: testSuiteRun.id },
        data: { totalTests: testCases.length },
      });

      // 4. Check if setup is required and queue accordingly
      // const testSuite = await this.prisma.testSuites.findUnique({
      //   where: { id: testSuiteId },
      //   include: { setupSteps: true }
      // });

      // if (testSuite?.setupSteps?.length > 0) {
      //   await this.queueWithSetup(testSuiteRun.id, testCaseRuns, options);
      // } else {
      await this.queueDirectExecution(
        testSuiteRun.id,
        testCaseRuns,
        testSuite?.projectId!,
      );
      // }

      return {
        testSuiteRunId: testSuiteRun.id,
        totalTestCases: testCases.length,
        testCaseRuns: testCaseRuns,
        message: 'Test suite execution started',
      };
    } catch (error) {
      this.logger.error(`Failed to start test suite ${testSuiteId}:`, error);

      await this.prisma.testSuiteRun.update({
        where: { id: testSuiteRun.id },
        data: {
          status: TestSuiteRunStatus.FAILED,
          completedAt: new Date(),
        },
      });

      // Release lock on failure to start
      await this.testEventsService.releaseLock(lockKey);

      // Emit error via Redis
      await this.testEventsService.publishTestSuiteEvent({
        type: 'setup-failed',
        testSuiteRunId: testSuiteRun.id,
        data: { error: error.message },
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  private async queueWithSetup(
    testSuiteRunId: string,
    testCaseRuns: any[],
    options: { environment: string; browser: string; version?: string },
  ) {
    const testSuiteRun = await this.prisma.testSuiteRun.findUnique({
      where: { id: testSuiteRunId },
    });

    const cacheKey = `setup:${testSuiteRun?.testSuiteId}:${options.environment}:${options.browser}`;
    const jobIds: string[] = [];

    // Set setup status to pending
    await this.testEventsService.setSetupStatus(cacheKey, 'pending');

    // Queue setup first with high priority
    const setupJob = await this.setupQueue.add(
      'run-setup',
      {
        testSuiteId: testSuiteRun?.testSuiteId!,
        testSuiteRunId,
        environment: options.environment,
        browser: options.browser,
        cacheKey,
      },
      {
        priority: 100,
        attempts: 2,
        backoff: { type: 'fixed', delay: 5000 },
      },
    );

    jobIds.push(setupJob?.id?.toString()!);

    // Queue all test cases with dependency on setup
    const testCaseJobs = await Promise.all(
      testCaseRuns.map(async (testCaseRun, index) => {
        const job = await this.executionQueue.add(
          'run-test-case',
          {
            testCaseRunId: testCaseRun.id,
            testCaseId: testCaseRun.testCaseId,
            testSuiteRunId,
            testSuiteId: testSuiteRun?.testSuiteId!,
            setupCacheKey: cacheKey,
          },
          {
            priority: 50,
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            delay: 2000 + index * 100, // Wait for setup + stagger
          },
        );

        jobIds.push(job?.id?.toString()!);
        return job;
      }),
    );

    // Track jobs for this test suite run
    this.jobTracker.set(testSuiteRunId, jobIds);

    this.logger.log(
      `Queued setup job ${setupJob?.id} and ${testCaseJobs.length} test case jobs for suite run ${testSuiteRunId}`,
    );
  }

  private async queueDirectExecution(
    testSuiteRunId: string,
    testCaseRuns: any[],
    projectId: string,
  ) {
    const jobIds: string[] = [];

    const projectVariables = await this.prisma.projectVariable.findMany({
      where: {
        projectId: projectId,
      },
    });
    const testSuiteVariables = await this.prisma.testSuiteVariable.findMany({
      where: { testSuiteId: testCaseRuns[0].testSuiteId },
    });
    const projectFunctions = await this.prisma.projectFunction.findMany({
      where: {
        projectId: projectId,
      },
    });
    const testSuiteFunctions = await this.prisma.testSuiteFunction.findMany({
      where: { testSuiteId: testCaseRuns[0].testSuiteId },
    });

    let projectVariablesHash: Map<string, string> = new Map();
    let testSuiteVariablesHash: Map<string, string> = new Map();
    let projectFunctionsHash: Map<string, string> = new Map();
    let testSuiteFunctionsHash: Map<string, string> = new Map();

    for (const variable of projectVariables) {
      projectVariablesHash.set(variable.name, variable.value);
    }
    for (const variable of testSuiteVariables) {
      testSuiteVariablesHash.set(variable.name, variable.value);
    }

    for (const projectFunction of projectFunctions) {
      projectFunctionsHash.set(projectFunction.name, projectFunction.code);
    }

    for (const testSuiteFunction of testSuiteFunctions) {
      testSuiteFunctionsHash.set(
        testSuiteFunction.name,
        testSuiteFunction.code,
      );
    }

    const testCaseJobs = await Promise.all(
      testCaseRuns.map(async (testCaseRun, index) => {
        const job = await this.executionQueue.add(
          'run-test-case',
          {
            testCaseRunId: testCaseRun.id,
            testCaseId: testCaseRun.testCaseId,
            testSuiteRunId,
            testSuiteId: testCaseRun?.testSuiteId!,
            code: testCaseRun.testCase.code,
            projectVariablesHash: Object.fromEntries(projectVariablesHash),
            testSuiteVariablesHash: Object.fromEntries(testSuiteVariablesHash),
            projectFunctionsHash: Object.fromEntries(projectFunctionsHash),
            testSuiteFunctionsHash: Object.fromEntries(testSuiteFunctionsHash),
          },
          {
            priority: 50,
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            delay: index * 100,
          },
        );

        jobIds.push(job?.id?.toString()!);
        return job;
      }),
    );

    this.jobTracker.set(testSuiteRunId, jobIds);
    this.logger.log(
      `Queued ${testCaseJobs.length} test case jobs for direct execution (suite run ${testSuiteRunId})`,
    );
  }

  async cancelTestSuiteRunRealtime(testSuiteRunId: string) {
    this.logger.log(`Cancelling test suite run ${testSuiteRunId}`);

    // 1. Update database status
    const testSuiteRun = await this.prisma.testSuiteRun.update({
      where: { id: testSuiteRunId },
      data: {
        status: TestSuiteRunStatus.CANCELLED,
        completedAt: new Date(),
      },
    });

    // 2. Update all pending/running test case runs
    await this.prisma.testCaseRun.updateMany({
      where: {
        testSuiteRunId,
        status: {
          in: [
            TestCaseRunStatus.RUNNING,
            TestCaseRunStatus.PASSED,
            TestCaseRunStatus.FAILED,
            TestCaseRunStatus.SKIPPED,
            TestCaseRunStatus.TIMEOUT,
            TestCaseRunStatus.ERROR,
            TestCaseRunStatus.PENDING,
          ],
        },
      },
      data: {
        status: TestCaseRunStatus.ERROR,
        completedAt: new Date(),
      },
    });

    // 3. Remove/cancel queued jobs
    const jobIds = this.jobTracker.get(testSuiteRunId) || [];
    await Promise.all([
      this.cancelQueuedJobs(this.setupQueue, jobIds),
      this.cancelQueuedJobs(this.executionQueue, jobIds),
    ]);

    // 4. Publish cancellation event to workers
    await this.testEventsService.publishCancellationEvent({
      type: 'cancel-suite',
      testSuiteRunId,
      timestamp: new Date().toISOString(),
    });

    // 5. Clean up setup cache
    const cacheKey = `setup:${testSuiteRun?.testSuiteId}`;
    await this.testEventsService.deleteSetupCache(cacheKey);

    // 6. Clean up job tracker
    this.jobTracker.delete(testSuiteRunId);

    // 7. Emit cancellation event
    await this.testEventsService.publishTestSuiteEvent({
      type: 'test-suite-cancelled',
      testSuiteRunId,
      data: {
        status: TestSuiteRunStatus.CANCELLED,
        cancelledAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });

    // 8. Release run lock for this suite
    if (testSuiteRun?.testSuiteId) {
      await this.testEventsService.releaseLock(
        `test-suite:run-lock:${testSuiteRun.testSuiteId}`,
      );
    }

    return testSuiteRun;
  }

  async cancelTestCaseRealtime(testCaseRunId: string) {
    const testCaseRun = await this.prisma.testCaseRun.findUnique({
      where: { id: testCaseRunId },
    });

    if (!testCaseRun) {
      throw new Error('Test case run not found');
    }

    // Update status
    await this.prisma.testCaseRun.update({
      where: { id: testCaseRunId },
      data: {
        status: TestCaseRunStatus.ERROR,
        completedAt: new Date(),
      },
    });

    // Find and cancel the specific job
    const jobs = await this.executionQueue.getJobs([
      'waiting',
      'active',
      'delayed',
    ]);
    const targetJob = jobs.find(
      (job) => job.data.testCaseRunId === testCaseRunId,
    );

    if (targetJob) {
      await targetJob.remove();
    }

    // Publish cancellation event
    await this.testEventsService.publishCancellationEvent({
      type: 'cancel-test-case',
      testSuiteRunId: testCaseRun.testSuiteRunId,
      testCaseRunId,
      timestamp: new Date().toISOString(),
    });

    return testCaseRun;
  }

  private async cancelQueuedJobs(queue: Queue, jobIds: string[]) {
    const jobs = await queue.getJobs(['waiting', 'active', 'delayed']);
    const targetJobs = jobs.filter((job) =>
      jobIds.includes(job?.id?.toString()!),
    );

    await Promise.all(targetJobs.map((job) => job.remove()));
    this.logger.log(
      `Cancelled ${targetJobs.length} jobs from queue ${queue.name}`,
    );
  }

  async getTestSuiteRunStatus(testSuiteRunId: string) {
    const testSuiteRun = await this.prisma.testSuiteRun.findUnique({
      where: { id: testSuiteRunId },
      include: {
        testCaseRuns: {
          include: {
            testCase: true,
          },
        },
        testSuite: true,
      },
    });

    if (!testSuiteRun) {
      return null;
    }

    const totalTestCases = testSuiteRun.testCaseRuns.length;
    const completedTestCases = testSuiteRun.testCaseRuns.filter((run: any) =>
      [
        TestCaseRunStatus.PASSED,
        TestCaseRunStatus.FAILED,
        TestCaseRunStatus.SKIPPED,
        TestCaseRunStatus.TIMEOUT,
        TestCaseRunStatus.ERROR,
        TestCaseRunStatus.PENDING,
      ].includes(run.status),
    ).length;

    return {
      testSuiteRunId: testSuiteRun.id,
      status: testSuiteRun.status,
      progress: {
        completed: completedTestCases,
        total: totalTestCases,
        percentage:
          totalTestCases > 0
            ? Math.round((completedTestCases / totalTestCases) * 100)
            : 0,
      },
      testCaseRuns: testSuiteRun.testCaseRuns.map((run) => ({
        id: run.id,
        testCaseId: run.testCaseId,
        testCaseName: run.testCase.name,
        status: run.status,
        duration: run.duration,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
      })),
      startedAt: testSuiteRun.startedAt,
      completedAt: testSuiteRun.completedAt,
    };
  }

  async retryTestCase(testCaseRunId: string) {
    // Get the test case run details
    const testCaseRun = await this.prisma.testCaseRun.findUnique({
      where: { id: testCaseRunId },
      include: {
        testCase: true,
        testSuiteRun: {
          include: {
            testSuite: true,
          },
        },
      },
    });

    if (!testCaseRun) {
      throw new Error(`Test case run ${testCaseRunId} not found`);
    }

    // Reset the test case run status
    await this.prisma.testCaseRun.update({
      where: { id: testCaseRunId },
      data: {
        status: TestCaseRunStatus.PENDING,
        startedAt: new Date(),
        completedAt: null,
        duration: null,
      },
    });

    // Create new job data for retry
    // const retryAttempt = (testCaseRun.retryAttempt || 0) + 1;
    const jobData: TestCaseQueueData = {
      testCaseRunId: testCaseRunId,
      testCaseId: testCaseRun.testCaseId,
      testSuiteRunId: testCaseRun.testSuiteRunId,
      testSuiteId: testCaseRun.testSuiteRun.testSuiteId,
      retryAttempt: 0,
      code: testCaseRun.testCase.code,
    };

    // Add job to execution queue
    const job = await this.executionQueue.add('execute-test-case', jobData, {
      priority: 1, // Higher priority for retries
      delay: 0,
      attempts: 1,
    });

    this.logger.log(
      `Retrying test case ${testCaseRunId} with job ${job.id} (attempt ${0})`,
    );

    return job;
  }

  async findLatestRun(testSuiteId: string) {
    return await this.prisma.testSuiteRun.findFirst({
      where: {
        testSuiteId,
      },
      orderBy: {
        startedAt: 'desc' as const,
      },
      include: {
        testCaseRuns: {
          include: {
            stepResults: {
              where: {
                parentStepId: null,
              },
              include: {
                childSteps: true,
              },
            },
          },
        },
      },
    });
  }
}
