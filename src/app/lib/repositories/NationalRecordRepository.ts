import { NationalRecord, PrismaClient } from '@/generated/prisma/client';
import { UpdateNationalRecordDTO } from '../services/NationalRecordService';
import { Repository } from './Repository';

export class NationalRecordRepository extends Repository<NationalRecord> {
  constructor(prisma: PrismaClient) {
    super(prisma.nationalRecord);
  }

  async getRecentNationalRecords(limit: number = 1) {
    return await this.modelDelegate.findMany({
      take: limit,
      orderBy: {
        updatedAt: 'desc',
      }
    });
  }
  
  async updateNationalRecords(id: number, newData: UpdateNationalRecordDTO) {
    await this.modelDelegate.upsert({
      where: {
        id,
      },
      update: newData,
      create: newData,
    })
  }
}