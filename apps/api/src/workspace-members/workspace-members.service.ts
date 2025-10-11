import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class WorkspaceMembersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createWorkspaceMemberDto: any) {
    return 'This action adds a new workspaceMember';
  }

  async findAll(workspaceId: string) {
    return await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: true,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} workspaceMember`;
  }

  update(id: number, updateOrganizationMemberDto: any) {
    return `This action updates a #${id} workspaceMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} workspaceMember`;
  }
}
