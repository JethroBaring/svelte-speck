import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { ProjectsModule } from 'src/projects/projects.module';
import { WorkspaceMembersModule } from 'src/workspace-members/workspace-members.module';
import { WorkspaceMembersService } from 'src/workspace-members/workspace-members.service';
import { WorkspaceInvitationsModule } from 'src/workspace-invitations/workspace-invitations.module';

@Module({
  imports: [ProjectsModule, WorkspaceMembersModule, WorkspaceInvitationsModule],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceMembersService],
})
export class WorkspaceModule {}
