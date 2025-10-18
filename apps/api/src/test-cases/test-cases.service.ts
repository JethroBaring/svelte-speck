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
    // Create a map to track temporary IDs to database IDs for parent-child relationships
    const tempIdToDbId = new Map<string, string>();

    // Helper function to create step results recursively (parents first)
    const createStepResultsRecursively = async (stepResults: any[]) => {
      // First, create all root-level steps (those without a parentStepId or parentStepId not in current batch)
      for (const r of stepResults) {
        if (!r.parentStepId || !tempIdToDbId.has(r.parentStepId)) {
          // This is a root step or parent hasn't been created yet
          const tempId = r.id;
          const created = await this.prisma.testStepResult.create({
            data: {
              testCaseRunId: r.testCaseRunId,
              stepNumber: r.stepNumber,
              stepName: r.stepName,
              stmtType: r.stmtType,
              contextType: r.contextType,
              status: r.status,
              startedAt: r.startedAt,
              completedAt: r.completedAt,
              duration: r.duration,
              errorMessage: r.errorMessage,
              screenshot: r.screenshot,
              logs: r.logs,
              isLastStep: r.isLastStep || false,
              parentStepId: r.parentStepId && tempIdToDbId.has(r.parentStepId) ? tempIdToDbId.get(r.parentStepId) : null,
            } as any,
          });
          tempIdToDbId.set(tempId, created.id);
        }
      }

      // Then, create child steps that now have their parents in the database
      for (const r of stepResults) {
        if (r.parentStepId && tempIdToDbId.has(r.parentStepId) && !tempIdToDbId.has(r.id)) {
          const tempId = r.id;
          const parentDbId = tempIdToDbId.get(r.parentStepId);
          const created = await this.prisma.testStepResult.create({
            data: {
              testCaseRunId: r.testCaseRunId,
              stepNumber: r.stepNumber,
              stepName: r.stepName,
              stmtType: r.stmtType,
              contextType: r.contextType,
              status: r.status,
              startedAt: r.startedAt,
              completedAt: r.completedAt,
              duration: r.duration,
              errorMessage: r.errorMessage,
              screenshot: r.screenshot,
              logs: r.logs,
              isLastStep: r.isLastStep || false,
              parentStepId: parentDbId,
            } as any,
          });
          tempIdToDbId.set(tempId, created.id);
        }
      }
    };

    // Create all step results with proper parent-child relationships
    if (result?.results && Array.isArray(result.results)) {
      await createStepResultsRecursively(result.results);
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
