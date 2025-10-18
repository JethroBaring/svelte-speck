import { Injectable } from '@nestjs/common';
import {
  Prisma,
  TestCaseRunStatus,
  TestStepStatus,
  TestSuiteRunStatus,
} from '@repo/types/prisma';
import { MinioService } from 'src/common/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TestSuiteRunsEventsService } from 'src/test-suite-runs/test-suite-runs-events.service';

@Injectable()
export class TestCasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly testEventsService: TestSuiteRunsEventsService,
  ) {}

  async create(
    testSuiteId: string,
    createTestCaseDto: Prisma.TestCaseCreateInput,
  ) {
    const x = await this.prisma.testCase.create({
      data: {
        ...createTestCaseDto,
        testSuite: {
          connect: {
            id: testSuiteId,
          },
        },
      },
    });

    console.log(x);
    return x;
  }

  async findAllByProjectId(projectId: string) {
    return await this.prisma.testCase.findMany({
      where: {
        testSuite: {
          projectId,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findAll(testSuiteId: string) {
    const testCases = await this.prisma.testCase.findMany({
      where: {
        testSuite: {
          id: testSuiteId,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return testCases;
  }

  async findOne(testCaseId: string) {
    return await this.prisma.testCase.findUnique({
      where: {
        id: testCaseId,
      },
    });
  }

  async update(
    testCaseId: string,
    updateTestCaseDto: Prisma.TestCaseUpdateInput,
  ) {
    return await this.prisma.testCase.update({
      where: {
        id: testCaseId,
      },
      data: updateTestCaseDto,
    });
  }

  async remove(testCaseId: string) {
    return await this.prisma.testCase.delete({
      where: {
        id: testCaseId,
      },
    });
  }

  async updateTestCaseRunResult(
    testCaseRunId: string,
    result: {
      status: TestCaseRunStatus;
      duration?: number;
      errorMessage?: string;
      stackTrace?: string;
      logs?: string;
      results?: any;
    },
  ) {
    for (const r of result?.results || []) {
      await this.prisma.testStepResult.create({
        data: r,
      });
    }

    // Update test case run
    const testCaseRun = await this.prisma.testCaseRun.update({
      where: { id: testCaseRunId },
      data: {
        status:
          Array.isArray(result.results) &&
          result.results.length > 0 &&
          result.results.every((r) => r.status === TestStepStatus.PASSED)
            ? TestCaseRunStatus.PASSED
            : TestCaseRunStatus.FAILED,
        completedAt: new Date(),
        duration: result.duration,
      },
      include: {
        testCase: true,
      },
    });

    const remaining = await this.prisma.testCaseRun.count({
      where: {
        testSuiteRunId: testCaseRun?.testSuiteRunId!,
        status: { in: [TestCaseRunStatus.RUNNING, TestCaseRunStatus.PENDING] },
      },
    });

    if (remaining === 0) {
      const passedTests = await this.prisma.testCaseRun.count({
        where: {
          testSuiteRunId: testCaseRun?.testSuiteRunId!,
          status: TestCaseRunStatus.PASSED,
        },
      });

      const failedTests = await this.prisma.testCaseRun.count({
        where: {
          testSuiteRunId: testCaseRun?.testSuiteRunId!,
          status: TestCaseRunStatus.FAILED,
        },
      });

      await this.prisma.testSuiteRun.update({
        where: { id: testCaseRun?.testSuiteRunId! },
        data: {
          status: TestSuiteRunStatus.COMPLETED,
          completedAt: new Date(),
          passedTests: passedTests,
          failedTests: failedTests,
        },
      });

      await this.testEventsService.publishTestSuiteEvent({
        type: 'test-suite-completed',
        testSuiteRunId: testCaseRun?.testSuiteRunId!,
        data: { status: TestSuiteRunStatus.COMPLETED },
        timestamp: new Date().toISOString(),
      });

      // Release the run lock for this suite
      const suiteRun = await this.prisma.testSuiteRun.findUnique({
        where: { id: testCaseRun?.testSuiteRunId! },
        select: { testSuiteId: true },
      });
      if (suiteRun?.testSuiteId) {
        await this.testEventsService.releaseLock(
          `test-suite:run-lock:${suiteRun.testSuiteId}`,
        );
      }
    }

    return {
      testCaseRun,
      testSuiteRun: null, // Will be populated if needed
    };
  }

  async notifyTestCaseStarted(testCaseRunId: string) {
    const testCaseRun = await this.prisma.testCaseRun.update({
      where: { id: testCaseRunId },
      data: {
        status: TestCaseRunStatus.RUNNING,
        startedAt: new Date(),
      },
      include: {
        testCase: true,
        testSuiteRun: true,
      },
    });

    return testCaseRun;
  }
}
