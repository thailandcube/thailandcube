import { EventType, NationalRecord, Prisma, RecordType } from '@/generated/prisma/client';
import { NationalRecordRepository } from '../repositories/NationalRecordRepository';

export interface UpdateNationalRecordDTO {
  holder: string;
  competition: string;
  result: string;
  caption: string;
  event: EventType;
  type: RecordType;
  imageFileName: string;
  mimeType: string;
  imageData: Prisma.NationalRecordCreateInput['imageData'];
}

export class NationalRecordService {
  private repository: NationalRecordRepository;
  
  constructor(repository: NationalRecordRepository) {
    this.repository = repository;
  }

  async getAllNationalRecords() {
    const records = await this.repository.getAllNationalRecords();
    
    return this.formatRecords(records);
  }

  async getRecentNationalRecords(limit: number = 1) {
    const records = await this.repository.getRecentNationalRecords(limit);

    return this.formatRecords(records);
  }

  async updateNationalRecord(id: number, newData: UpdateNationalRecordDTO) {
    await this.repository.updateNationalRecords(id, newData);
  }

  private formatRecords(records: NationalRecord[]) {
    return records.map((record) => ({
      ...record,
      imageData: Buffer.from(record.imageData).toString('base64'),
    }));
  }
}