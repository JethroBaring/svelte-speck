import { Module } from '@nestjs/common';
import { WorkspaceMembersService } from './workspace-members.service';

@Module({
  controllers: [],
  providers: [WorkspaceMembersService],
  exports: [WorkspaceMembersService],
})
export class WorkspaceMembersModule {}
