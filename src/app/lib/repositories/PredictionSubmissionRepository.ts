import { PredictionSubmission, PrismaClient } from '@/generated/prisma/client';
import { Repository } from './Repository';

export class PredictionSubmissionRepository extends Repository<PredictionSubmission> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super(prisma.predictionSubmission);
    this.prisma = prisma;
  }

  getPrisma() {
    return this.prisma;
  }

  async getByUserIdFormId(userId: number, formId: string) {
    return await this.modelDelegate.findUnique({
      where: {
        userId_predictionFormId: {
          userId,
          predictionFormId: formId,
        },
      },
      include: {
        predictions: true,
      },
    });
  }
}