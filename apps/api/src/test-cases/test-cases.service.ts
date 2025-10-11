import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/types/prisma';
import { MinioService } from 'src/common/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TestCasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  async create(
    testSuiteId: string,
    createTestCaseDto: Prisma.TestCaseCreateInput,
  ) {
    const x = await this.prisma.testCase.create({
      data: {
        ...createTestCaseDto,
        testSuite: {
          connect: {
            id: testSuiteId,
          },
        },
      },
    });

    console.log(x);
    return x;
  }

  async findAllByProjectId(projectId: string) {
    return await this.prisma.testCase.findMany({
      where: {
        testSuite: {
          projectId,
        },
      },
      orderBy: {
        createdAt: 'asc',
      }
    });
  }

  async findAll(testSuiteId: string) {
    const testCases = await this.prisma.testCase.findMany({
      where: {
        testSuite: {
          id: testSuiteId,
        },
      },
      orderBy: {
        createdAt: 'asc',
      }
    });

    return testCases;
  }

  async findOne(testCaseId: string) {
    return await this.prisma.testCase.findUnique({
      where: {
        id: testCaseId,
      },
    });
  }

  async update(
    testCaseId: string,
    updateTestCaseDto: Prisma.TestCaseUpdateInput,
  ) {
    return await this.prisma.testCase.update({
      where: {
        id: testCaseId,
      },
      data: updateTestCaseDto,
    });
  }

  async remove(testCaseId: string) {
    return await this.prisma.testCase.delete({
      where: {
        id: testCaseId,
      },
    });
  }
}
