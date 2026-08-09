import { Competition, PrismaClient } from '@/generated/prisma/client';
import { Repository } from './Repository';

export class CompetitionRepository extends Repository<Competition, string> {
  constructor(prisma: PrismaClient) {
    super(prisma.competition);
  }

  override async getById(competitionId: string) {
    return await this.modelDelegate.findUnique({
      where: {
        competitionId,
      },
      include: {
        registrations: true,
        events: {
          include: {
            rounds: true,
          },
        },
      },
    });
  }
}