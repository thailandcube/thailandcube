'use server';

import { EventOptions } from '../lib/repositories/EventRepository';
import { eventService } from '../lib/services/instances';

/**
 * Fetches all events in the targetted competition
 * @param competitionId The competition ID of the desired competition.
 * @param options The options of the querying (result data)
 */
export async function getEventsInCompetition(competitionId: string, options: EventOptions) {
  try {
    return await eventService.getEventsInCompetition(competitionId, options);
  }
  catch (error) {
    console.error('Failed to fetch all events inside competition in action:', error);
    return [];
  }
}