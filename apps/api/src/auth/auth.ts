import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@repo/types/prisma';
import { WorkspaceService } from 'src/workspaces/workspace.service';
import { PrismaService } from 'src/prisma/prisma.service';

const prisma = new PrismaClient();
const workspaceService = new WorkspaceService(new PrismaService());

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  basePath: '/auth',
  trustedOrigins: ['http://localhost:5173'],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await workspaceService.create(user.id, {
            name: user.name + "'s Workspace",
            icon: 'Briefcase'
          });
        },
      },
    },
  },
});
