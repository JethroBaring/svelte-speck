import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role } from '@repo/types/prisma';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createWorkspaceDto: Prisma.WorkspaceUncheckedCreateInput,
  ) {
    const workspace = await this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          ...createWorkspaceDto,
          ownerId: userId,
        },
      });

      await tx.workspaceMember.create({
        data: {
          userId,
          role: Role.OWNER,
          workspaceId: workspace.id,
        },
      });

      return workspace;
    });

    return workspace;
  }

  async findAll(userId: string) {
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          where: {
            userId,
          },
          take: 1,
        }
      },
    });
    
    return workspaces.map(workspace => {
      const { members, ...workspaceData } = workspace;
      return {
        ...workspaceData,
        member: members[0]
      };
    });
  }

  async update(id: string, updateWorkspaceDto: Prisma.WorkspaceUpdateInput) {
    return await this.prisma.workspace.update({
      where: {
        id,
      },
      data: updateWorkspaceDto,
    });
  }

  async remove(id: string) {
    return await this.prisma.workspace.delete({
      where: {
        id,
      },
    });
  }

  async userBelongsToWorkspace(userId: string) {
    const workspace = await this.prisma.workspaceMember.findFirst({
      where: {
        userId,
      },
    });

    return workspace !== null;
  }
}
