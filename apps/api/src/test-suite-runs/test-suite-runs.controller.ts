import { Public } from '@mguay/nestjs-better-auth';
import { Controller, Get, Param, Post, Put } from '@nestjs/common';
import { TestCaseRunStatus } from '@repo/types/prisma';
import { TestSuiteRunsService } from './test-suite-runs.service';

@Controller('test-suite-runs')
export class TestSuiteRunsController {
  constructor(private readonly testSuiteRunsService: TestSuiteRunsService) {}

  @Post('run-suite/:testSuiteId')
  @Public()
  async runTestSuite(@Param('testSuiteId') testSuiteId: string) {
    return await this.testSuiteRunsService.runTestSuite(testSuiteId);
  }

  @Put('cancel-suite-run/:testSuiteRunId')
  async cancelTestSuiteRun(@Param('testSuiteRunId') testSuiteRunId: string) {
    const result =
      await this.testSuiteRunsService.cancelTestSuiteRunRealtime(
        testSuiteRunId,
      );
    return {
      message: 'Test suite run cancelled',
      testSuiteRun: result,
    };
  }

  @Put('cancel-test-case/:testCaseRunId')
  async cancelTestCase(@Param('testCaseRunId') testCaseRunId: string) {
    const result =
      await this.testSuiteRunsService.cancelTestCaseRealtime(testCaseRunId);
    return {
      message: 'Test case cancelled',
      testCaseRun: result,
    };
  }

  @Post('retry-test-case/:testCaseRunId')
  async retryTestCase(@Param('testCaseRunId') testCaseRunId: string) {
    const job = await this.testSuiteRunsService.retryTestCase(testCaseRunId);
    return {
      jobId: job.id,
      message: 'Test case queued for retry',
    };
  }

  @Get('suite-run/:testSuiteRunId/status')
  async getTestSuiteRunStatus(@Param('testSuiteRunId') testSuiteRunId: string) {
    const status =
      await this.testSuiteRunsService.getTestSuiteRunStatus(testSuiteRunId);

    if (!status) {
      return { message: 'Test suite run not found' };
    }

    return {
      ...status,
      summary: {
        totalTests: status.progress.total,
        passedTests: status.progress.completed,
        failedTests: status.progress.total - status.progress.completed,
        skippedTests: 0,
        // skippedTests: status.progress.total - status.progress.completed - status.progress.failed,
        runningTests: status.testCaseRuns.filter(
          (run) => run.status === TestCaseRunStatus.RUNNING,
        ).length,
        pendingTests: status.testCaseRuns.filter(
          (run) => run.status === TestCaseRunStatus.PENDING,
        ).length,
        // completedTests: status.progress.completed + status.progress.failed + status.progress.skipped,
        completedTests: 0,
        // progressPercentage: status.progress.total > 0
        //   ? Math.round(((status.progress.completed + status.progress.failed + status.progress.skipped) / status.progress.total) * 100)
        //   : 0,
        progressPercentage: 0,
        duration: status.completedAt
          ? new Date(status.completedAt).getTime() -
            new Date(status.startedAt).getTime()
          : new Date().getTime() - new Date(status.startedAt).getTime(),
      },
    };
  }

  @Get(':id/latest-run')
  findCurrentRun(@Param('id') id: string) {
    return this.testSuiteRunsService.findLatestRun(id);
  }
}
