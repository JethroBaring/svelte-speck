import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TestSuiteRunsService } from './test-suite-runs.service';
import { TestSuiteRunsController } from './test-suite-runs.controller';
import { TestSuiteRunsWebSocketGateway } from './test-suite-runs-websocket.gateway';
import { TestSuiteRunsEventsService } from './test-suite-runs-events.service';
import { RedisModule } from '../common/redis';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    RedisModule,
    BullModule.registerQueue(
      {
        name: 'test-setup-queue',
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
        },
      },
      {
        name: 'test-execution-queue',
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 20,
        },
      },
    ),
  ],
  providers: [
    TestSuiteRunsService,
    TestSuiteRunsWebSocketGateway,
    TestSuiteRunsEventsService,
    PrismaService,
  ],
  controllers: [TestSuiteRunsController],
  exports: [TestSuiteRunsService, TestSuiteRunsWebSocketGateway, TestSuiteRunsEventsService],
})
export class TestSuiteRunsModule {}