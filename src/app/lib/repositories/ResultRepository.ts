import { PrismaClient, Result } from '@/generated/prisma/client';
import { Repository } from './Repository';

export class ResultRepository extends Repository<Result> {
  constructor(prisma: PrismaClient) {
    super(prisma.result);
  }

  async deleteCompetitorResult(competitorId: number, competitionId: string) {
    return await this.modelDelegate.deleteMany({
      where: {
        competitorId,
        round: {
          event: {
            competitionId
          },
        },
      },
    });
  }
}