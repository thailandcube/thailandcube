import { PredictionAnswer } from '@/generated/prisma';
import { Repository } from './Repository';
import { PrismaClient } from '@/generated/prisma/client';

export class PredictionAnswerRepository extends Repository<PredictionAnswer> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super(prisma.predictionAnswer);
    this.prisma = prisma;
  }

  getPrisma() {
    return this.prisma;
  }
}