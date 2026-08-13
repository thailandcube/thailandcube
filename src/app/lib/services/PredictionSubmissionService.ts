/* eslint-disable @typescript-eslint/no-explicit-any */
import { PredictionSubmission } from '@/generated/prisma/client';
import { PredictionSubmissionRepository } from '../repositories/PredictionSubmissionRepository';
import { Service } from './Service';

export class PredictionSubmissionService extends Service<PredictionSubmission, PredictionSubmissionRepository> {
  constructor(repository: PredictionSubmissionRepository) {
    super(repository);
  }

  async getByUserIdFormId(userId: number, formId: string) {
    return await this.repository.getByUserIdFormId(userId, formId);
  }

  async upsertSubmission(predictionFormId: string, userId: number, wcaId: string | null, wantPrize: boolean, flatPredictions: any[]) {
    return await this.repository.getPrisma().$transaction(async (tx) => {
      const existingSubmission = await tx.predictionSubmission.findUnique({
        where: {
          userId_predictionFormId: {
            userId,
            predictionFormId,
          },
        },
      });

      if (existingSubmission) {
        await tx.predictionRecord.deleteMany({
          where: { submissionId: existingSubmission.id },
        });

        return await tx.predictionSubmission.update({
          where: { id: existingSubmission.id },
          data: {
            wcaId: wcaId || null,
            wantsPrize: wantPrize,
            predictions: { create: flatPredictions },
          },
        });
      } 
      else {
        return await tx.predictionSubmission.create({
          data: {
            userId,
            predictionFormId,
            wcaId: wcaId || null,
            wantsPrize: wantPrize,
            predictions: { create: flatPredictions },
          },
        });
      }
    });
  }
}