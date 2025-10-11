import { Module } from '@nestjs/common';
import { WorkspaceInvitationsService } from './workspace-invitations.service';
import { CryptoService } from 'src/common/crypto/crypto.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [],
  providers: [WorkspaceInvitationsService, CryptoService, MailService],
  exports: [WorkspaceInvitationsService],
})
export class WorkspaceInvitationsModule {}
