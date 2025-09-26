import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@repo/types/prisma';
import { OrganizationService } from 'src/organization/organization.service';
import { PrismaService } from 'src/prisma/prisma.service';

const prisma = new PrismaClient();
const organizationService = new OrganizationService(new PrismaService());

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
          await organizationService.create(user.id, {
            name: user.name + "'s Organization",
            description: user.email + "'s Organization",
          });
        },
      },
    },
  },
});
