'use server';

import { competitionService } from '../lib/services/instances';

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

/**
 * Fetches all competitions in the database.
 * @param id Competition ID of the target
 */
export async function getCompetitionById(id: string) {
  try {
    return await competitionService.getById(id);
  }
  catch (error) {
    console.error(`Failed to fetch competition with an id of ${id}  in action:`, error);
    return null;
  }
}