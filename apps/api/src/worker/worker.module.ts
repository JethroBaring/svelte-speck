// src/worker/worker.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { RedisModule } from '../common/redis';
import { TestCasesModule } from 'src/test-cases/test-cases.module';
import { WorkerController } from './worker.controller';

@Module({
  imports: [
    RedisModule,
    TestCasesModule,
    BullModule.registerQueue({
      name: 'database-updates-queue',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    }),
  ],
  controllers: [WorkerController],
})
export class WorkerModule {}
