import { PrismaClient, Event } from '@/generated/prisma/client';
import { Repository } from './Repository';

export interface EventOptions {
  withRounds?: boolean
  withRegistrationEvents?: boolean
}

export class EventRepository extends Repository<Event> {
  constructor(prisma: PrismaClient) {
    super(prisma.event);
  }

  async getEventsInCompetition(competitionId: string, options: EventOptions) {
    const { withRounds = true, withRegistrationEvents = true } = options; 

    const queryRelations = {
      rounds: withRounds,
      registrationEvents: withRegistrationEvents,
    };

    return await this.modelDelegate.findMany({
      where: {
        competitionId,
      },
      include: queryRelations,
    });
  }
}