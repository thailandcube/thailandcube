'use server';

import { CompetitorOptions } from '../lib/repositories/CompetitorRepository';
import { competitorService, registrationService } from '../lib/services/instances';

/**
 * Fetches the most recent national records.
 * @param competitionId The competition ID of the desired competition.
 * @param options The options of the querying (result data)
 */
export async function getCompetitorsByCompetitionId(competitionId: string, options: CompetitorOptions = {}) {
  try {
    return await competitorService.getCompetitorsByCompetitionId(competitionId, options);
  }
  catch (error) {
    console.error('Failed to fetch all competitions in action:', error);
    return [];
  }
}

/**
 * Delete specific competitor from specific competition
 * @param competitorId The competitor ID of the desired deletion.
 * @param competitionId The competition ID of the desired deletion.
 */
export async function deleteCompetitorFromCompetition(competitorId: number, competitionId: string) {
  try {
    await registrationService.withdrawCompetitor(competitorId, competitionId);

    return {success: true, message: 'Competitor successfully removed from competition.' };
  }
  catch (error) {
    console.error('Failed to delete competitor in action:', error);

    return {success: false, message: error || 'Failed to delete'};
  }
}