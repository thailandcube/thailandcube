'use server';

import { EventType, RecordType } from '@/generated/prisma/enums';
import { DatabaseClient } from '../lib/clients/DatabaseClient';
import { NationalRecordRepository } from '../lib/repositories/NationalRecordRepository';
import { NationalRecordService } from '../lib/services/NationalRecordService';

const prisma = DatabaseClient.getInstance();
const nationalRecordRepository = new NationalRecordRepository(prisma);
const nationalRecordService = new NationalRecordService(nationalRecordRepository);

export async function getAllNationalRecords() {
  try {
    const records = await nationalRecordService.getAllNationalRecords();

    return {
      success: true,
      data: records,
    };
  }
  catch (err) {
    console.error('Error in getAllNationalRecords action:', err);
  
    return { 
      success: false, 
      error: 'Failed to retrieve national records. Please try again later.' 
    };
  }
}

/**
 * Fetches the most recent national records.
 * @param limit The number of records to retrieve (default is 1).
 */
export async function getRecentNationalRecords(limit: number = 1) {
  try {
    const records = await nationalRecordService.getRecentNationalRecords(limit);
    
    return { 
      success: true, 
      data: records
    };
  } 
  catch (error) {
    console.error('Error in getRecentNationalRecords action:', error);
    return { 
      success: false, 
      error: 'Failed to retrieve recent national records.' 
    };
  }
}

/**
 * Update national record data
 * @param id The id of the updated national record.
 * @param formData The data of the updated national record.
 */
export async function updateNationalRecord(id: number, formData: FormData) {
  try {
    const file = formData.get('file') as File;

    if (!file || file.size === 0)
      return { success: false, message: 'No file uploaded' };

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const newData = {
      holder: formData.get('holder') as string,
      competition: formData.get('competition') as string,
      result: formData.get('result') as string,
      caption: formData.get('caption') as string,
      event: formData.get('event') as EventType,
      type: formData.get('type') as RecordType,
      imageFileName: file.name,
      mimeType: file.type,
      imageData: buffer
    };

    await nationalRecordService.updateNationalRecord(id, newData);

    return { success: true, message: 'Record updated successfully' };
  }
  catch (err) {
    return { success: false, message: err };
  }
}