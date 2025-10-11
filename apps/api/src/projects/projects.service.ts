import { Injectable, Logger } from '@nestjs/common';
import { Permission, Prisma } from "@repo/types/prisma";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name)

  constructor(private readonly prisma: PrismaService) {}

  async create(workspaceId: string, userId: string, createProjectDto: Prisma.ProjectUncheckedCreateInput) {
    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        createdBy: userId,
        workspaceId,
      }
    })
    
    const workspaceMember = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    })

    await this.prisma.projectMember.create({
      data: {
        projectId: project.id,
        permission: Permission.EDITOR,
        workspaceMemberId: workspaceMember?.id!,
      },
    })

    return project
  }

  async findAll(workspaceId: string, userId: string) {
    const workspaceMember = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    })

    console.log("workspaceMember", workspaceMember);

    return await this.prisma.project.findMany({
      where: {
        members: {
          some: {
            workspaceMemberId: workspaceMember?.id!
          }
        }
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            testSuites: true,
          },
        },
        testSuites: {
          select: {
            _count: {
              select: {
                testCases: true,
              },
            },
          },
        },
      }
    })
  }

  async update(id: string, updateProjectDto: Prisma.ProjectUpdateInput) {
    return await this.prisma.project.update({
      where: {
        id,
      },
      data: updateProjectDto,
    })
  }

  async remove(id: string) {
    try {
      return await this.prisma.project.delete({
        where: {
          id,
        },
      })
    } catch (error) {
      this.logger.error(`Failed to delete project ${id}`, error.stack)
      throw error
    }
  }
}
