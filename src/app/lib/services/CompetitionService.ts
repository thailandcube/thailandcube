import { Competition } from '@/generated/prisma/client';
import { CompetitionRepository } from '../repositories/CompetitionRepository';
import { Service } from './Service';

export class CompetitionService extends Service<Competition, CompetitionRepository> {
  constructor(repository: CompetitionRepository) {
    super(repository);
  }
}