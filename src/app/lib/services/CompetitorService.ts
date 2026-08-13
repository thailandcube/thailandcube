import { Service } from './Service';
import { Competitor } from '@/generated/prisma/client';
import { CompetitorOptions, CompetitorRepository } from '../repositories/CompetitorRepository';

export class CompetitorService extends Service<Competitor, CompetitorRepository> {
  constructor(repository: CompetitorRepository) {
    super(repository);
  }

  async getCompetitorsByCompetitionId(competitionId: string, options: CompetitorOptions = {}) {
    return await this.repository.getCompetitorsByCompetitionId(competitionId, options);
  }
}