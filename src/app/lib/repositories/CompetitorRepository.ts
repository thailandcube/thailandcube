import { Competitor, PrismaClient } from '@/generated/prisma/client';
import { Repository } from './Repository';

export interface CompetitorOptions {
  withRegistrations?: boolean;
  withResults?: boolean;
}

export class CompetitorRepository extends Repository<Competitor> {
  constructor(prisma: PrismaClient) {
    super(prisma.competitor);
  }

  async getCompetitorsByCompetitionId(competitionId: string, options: CompetitorOptions = {}) {
    const { withRegistrations = true, withResults = false } = options; 

    return await this.modelDelegate.findMany({
      where: {
        registrations: {
          some: {
            competitionId,
          },
        },
      },
      include: {
        registrations: withRegistrations ? {
          where: {
            competitionId
          },
          select: {
            id: true,
            competitionId: true,
            events: {
              select: {
                event: true,
                eventId: true,
              },
            },
          },
        } : false,
        results: withResults,
      },
      orderBy: {
        id: 'asc',
      }
    })
  }
}