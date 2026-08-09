import { Result } from '@/generated/prisma/client';
import { ResultRepository } from '../repositories/ResultRepository';
import { Service } from './Service';

export class ResultService extends Service<Result, ResultRepository> {
  constructor(repository: ResultRepository) {
    super(repository);
  }

  async getResultsInRound(roundId: number) {
    return await this.repository.getResultsInRound(roundId);
  }

  async deleteCompetitorResult(competitorId: number, competitionId: string) {
    const deletedResult = await this.repository.deleteCompetitorResult(competitorId, competitionId);

    return deletedResult;
  }
}