import { Competition, Prisma } from '@/generated/prisma/client';
import { CompetitionRepository } from '../repositories/CompetitionRepository';
import { Service } from './Service';

export type ExtendedCompetition = Prisma.CompetitionGetPayload<{
  include: {
    registrations: true;
    events: {
      include: {
        rounds: true;
      };
    };
  };
}>;

export class CompetitionService extends Service<Competition, CompetitionRepository, ExtendedCompetition, string> {
  constructor(repository: CompetitionRepository) {
    super(repository);
  }
}