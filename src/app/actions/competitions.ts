'use server';

import { DatabaseClient } from '../lib/clients/DatabaseClient';
import { CompetitionRepository } from '../lib/repositories/CompetitionRepository';
import { CompetitionService } from '../lib/services/CompetitionService';

const prisma = DatabaseClient.getInstance();
const competitionRepository = new CompetitionRepository(prisma);
const competitionService = new CompetitionService(competitionRepository);

/**
 * Fetches all competitions in the database.
 */
export async function getAllCompetitions() {
  try {
    return await competitionService.getAll();
  }
  catch (error) {
    console.error('Failed to fetch all competitions in action:', error);
    return [];
  }
}