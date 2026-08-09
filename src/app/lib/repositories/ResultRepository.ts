import { PrismaClient, Result } from '@/generated/prisma/client';
import { Repository } from './Repository';

export class ResultRepository extends Repository<Result> {
  constructor(prisma: PrismaClient) {
    super(prisma.result);
  }

  async getResultsInRound(roundId: number) {
    return await this.modelDelegate.findMany({
      where: {
        round: {
          id: roundId,
        }
      },
      include: {
        competitor: true
      },
      orderBy: [
        { result: 'asc' },
        { best: 'asc' }
      ] 
    });
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