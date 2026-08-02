import { EventOptions, EventRepository } from '../repositories/EventRepository';
import { Service } from './Service';
import { Event } from '@/generated/prisma/client';

export class EventService extends Service<Event, EventRepository> {
  constructor(repository: EventRepository) {
    super(repository);
  }

  async getEventsInCompetition(competitionId: string, options: EventOptions) {
    return await this.repository.getEventsInCompetition(competitionId, options);
  }
}