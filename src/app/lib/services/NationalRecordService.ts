import { EventType, NationalRecord, Prisma, RecordType } from '@/generated/prisma/client';
import { NationalRecordRepository } from '../repositories/NationalRecordRepository';
import { Service } from './Service';

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

export type FormattedNationalRecord = Omit<NationalRecord, 'imageData'> & { 
  imageData: string;
};

export class NationalRecordService extends Service<NationalRecord, NationalRecordRepository, FormattedNationalRecord> {
  constructor(repository: NationalRecordRepository) {
    super(repository);
  }

  protected format(record: NationalRecord): FormattedNationalRecord {
    return {
      ...record,
      imageData: Buffer.from(record.imageData).toString('base64'),
    };
  }

  async getRecentNationalRecords(limit: number = 1) {
    const records = await this.repository.getRecentNationalRecords(limit);
    return this.formatRecords(records);
  }

  async updateNationalRecord(id: number, newData: UpdateNationalRecordDTO) {
    return await this.repository.updateNationalRecords(id, newData);
  }

  private formatRecords(records: NationalRecord[]) {
    return records.map((record) => ({
      ...record,
      imageData: Buffer.from(record.imageData).toString('base64'),
    }));
  }
}