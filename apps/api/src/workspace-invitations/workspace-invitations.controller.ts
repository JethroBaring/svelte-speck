import { Controller, Post, Param } from '@nestjs/common';
import { WorkspaceInvitationsService } from './workspace-invitations.service';

@Controller('workspaces/invitations')
export class WorkspaceInvitationsController {
  constructor(
    private readonly workspaceInvitationsService: WorkspaceInvitationsService,
  ) {}

  @Post(':token/verify')
  verifyInvitation(
    @Param('token') token: string,
  ) {
    return this.workspaceInvitationsService.verifyInvitation(token);
  }
}
