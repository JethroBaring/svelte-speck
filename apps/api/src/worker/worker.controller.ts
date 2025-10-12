import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { TestCasesService } from 'src/test-cases/test-cases.service';
import { Public } from '@mguay/nestjs-better-auth';
import { TestCaseRunStatus } from '@repo/types/prisma';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { ApiKey } from 'src/common/decorators/api-key.decorator';

@UseGuards(ApiKeyGuard)
@Controller('worker')
@ApiKey()
export class WorkerController {
  constructor(private readonly testCaseService: TestCasesService) {}

  @Put('test-case-runs/:testCaseRunId/start')
  @Public()
  async notifyTestCaseStarted(@Param('testCaseRunId') testCaseRunId: string) {
    const result =
      await this.testCaseService.notifyTestCaseStarted(testCaseRunId);
    return {
      message: 'Test case start recorded',
      testCaseRun: result,
    };
  }

  @Put('test-case-runs/:testCaseRunId/complete')
  @Public()
  async updateTestCaseResult(
    @Param('testCaseRunId') testCaseRunId: string,
    @Body()
    body: {
      status: TestCaseRunStatus;
      duration?: number;
      errorMessage?: string;
      stackTrace?: string;
      logs?: string;
      results?: any;
    },
  ) {
    const result = await this.testCaseService.updateTestCaseRunResult(
      testCaseRunId,
      {
        status: body.status as any,
        duration: body.duration,
        errorMessage: body.errorMessage,
        stackTrace: body.stackTrace,
        logs: body.logs,
        results: body.results,
      },
    );

    return {
      message: 'Test case result updated',
      testCaseRun: result.testCaseRun,
      testSuiteRun: result.testSuiteRun,
    };
  }

  @Post('test-case-comments/:testCaseId/add')
  @Public()
  async addTestCaseComment(
    @Param('testCaseId') testCaseId: string,
    @Body() body: { comment: string; createdBy: string },
  ) {
    // const result = await this.testCaseService.notifyTestCaseCommentsStarted(
    //   body.testCaseRunId,
    // );
  }
}
