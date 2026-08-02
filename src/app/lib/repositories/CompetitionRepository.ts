import { Competition, PrismaClient } from '@/generated/prisma/client';
import { Repository } from './Repository';

export class CompetitionRepository extends Repository<Competition> {
  constructor(prisma: PrismaClient) {
    super(prisma.competition);
  }
}