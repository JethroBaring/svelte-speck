import { Module } from '@nestjs/common';
import { TestCasesService } from './test-cases.service';
import { TestCasesController } from './test-cases.controller';
import { TestSuiteRunsModule } from 'src/test-suite-runs/test-suite-runs.module';

@Module({
  imports: [TestSuiteRunsModule],
  controllers: [TestCasesController],
  providers: [TestCasesService],
  exports: [TestCasesService],
})
export class TestCasesModule {}
