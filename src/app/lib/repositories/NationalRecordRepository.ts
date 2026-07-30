/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@/generated/prisma/client';
import { UpdateNationalRecordDTO } from '../services/NationalRecordService';

export class NationalRecordRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getAllNationalRecords() {
    return await this.prisma.nationalRecord.findMany({
      orderBy: {
        id: 'asc',
      },
    });
  }

  async getRecentNationalRecords(limit: number = 1) {
    return await this.prisma.nationalRecord.findMany({
      take: limit,
      orderBy: {
        updatedAt: 'desc',
      }
    });
  }
  
  async updateNationalRecords(id: number, newData: UpdateNationalRecordDTO) {
    await this.prisma.nationalRecord.upsert({
      where: {
        id,
      },
      update: newData,
      create: newData,
    })
  }
}