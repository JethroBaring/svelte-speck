import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@repo/types/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CryptoService } from 'src/common/crypto/crypto.service';
import { MailService } from 'src/mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WorkspaceInvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    workspaceId: string,
    inviterId: string,
    createWorkspaceInvitationDto: Prisma.WorkspaceInvitationUncheckedCreateInput,
  ) {
    const workspaceInvitation = await this.prisma.workspaceInvitation.create({
      data: {
        ...createWorkspaceInvitationDto,
        workspaceId,
      },
      include: {
        workspace: true,
      },
    });

    const inviter = await this.prisma.user.findUnique({
      where: {
        id: inviterId,
      },
    });

    if (!inviter) {
      throw new NotFoundException('Inviter not found');
    }

    const tokenPayload = JSON.stringify({
      workspaceInvitationId: workspaceInvitation.id,
      workspaceId: workspaceInvitation.workspaceId,
      role: workspaceInvitation.role,
      inviterId: inviterId,
      inviteeEmail: workspaceInvitation.email,
    });

    const token = this.cryptoService.encrypt(tokenPayload);

    await this.mailService.sendInvitationEmail({
      inviterName: inviter.name,
      inviteeEmail: workspaceInvitation.email,
      workspaceName: workspaceInvitation.workspace.name,
      invitationLink: `${this.configService.getOrThrow<string>(
        'BASE_URL',
      )}/${encodeURIComponent(token)}`,
    });

    return workspaceInvitation;
  }

  async update(
    id: string,
    updateOrganizationInvitationDto: Prisma.WorkspaceInvitationUpdateInput,
  ) {
    return await this.prisma.workspaceInvitation.update({
      where: { id },
      data: updateOrganizationInvitationDto,
    });
  }

  async verifyInvitation(token: string) {
    const tokenPayload = this.cryptoService.decrypt(token);
    const tokenPayloadJson = JSON.parse(tokenPayload);
    return await this.prisma.workspaceInvitation.findUnique({
      where: {
        id: tokenPayloadJson.workspaceInvitationId,
        status: 'PENDING',
        createdAt: { gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) },
      },
    });
  }
}
