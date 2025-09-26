import { Controller, Post, Param } from '@nestjs/common';
import { OrganizationInvitationsService } from './organization-invitations.service';

@Controller('organizations/invitations')
export class OrganizationInvitationsController {
  constructor(
    private readonly organizationInvitationsService: OrganizationInvitationsService,
  ) {}

  @Post(':token/verify')
  verifyInvitation(
    @Param('token') token: string,
  ) {
    return this.organizationInvitationsService.verifyInvitation(token);
  }
}
