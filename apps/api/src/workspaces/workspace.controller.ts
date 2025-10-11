import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { ZodValidationPipe } from "src/common/pipes/zod-validation-pipe";
import { WorkspaceCreateSchema, WorkspaceUpdateSchema, ProjectCreateSchema, WorkspaceInvitationCreateSchema } from "@repo/types";
import { Session } from "@mguay/nestjs-better-auth";
import type { UserSession } from "@mguay/nestjs-better-auth";
import { ProjectsService } from "src/projects/projects.service";
import { WorkspaceMembersService } from "src/workspace-members/workspace-members.service";
import { WorkspaceInvitationsService } from "src/workspace-invitations/workspace-invitations.service";

@Controller('workspaces')
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly projectsService: ProjectsService,
    private readonly workspaceMembersService: WorkspaceMembersService,
    private readonly workspaceInvitationsService: WorkspaceInvitationsService,
  ) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(WorkspaceCreateSchema))
    createWorkspaceDto: any,
    @Session() session: UserSession,
  ) {
    return this.workspaceService.create(session.user.id, createWorkspaceDto);
  }

  @Get()
  findAll(@Session() session: UserSession) {
    console.log(session.user.id)
    return this.workspaceService.findAll(session.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(WorkspaceUpdateSchema))
    updateWorkspaceDto: any,
  ) {
    return this.workspaceService.update(id, updateWorkspaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workspaceService.remove(id);
  }

  @Post(':id/projects')
  createProject(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ProjectCreateSchema))
    createProjectDto: any,
    @Session() session: UserSession,
  ) {
    console.log(id, session.user.id, createProjectDto)
    return this.projectsService.create(id, session.user.id, createProjectDto);
  }

  @Get(':id/projects')
  findProjects(@Param('id') id: string, @Session() session: UserSession) {
    return this.projectsService.findAll(id, session.user.id);
  }

  @Get(':id/members')
  findMembers(@Param('id') id: string) {
    return this.workspaceMembersService.findAll(id);
  }

  @Post(':id/invitations')
  invite(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(WorkspaceInvitationCreateSchema))
    inviteDto: any,
    @Session() session: UserSession,
  ) {
    return this.workspaceInvitationsService.create(id, session.user.id, inviteDto);
  }
}
