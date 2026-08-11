import { PredictionAnswer, Prisma } from '@/generated/prisma/client';
import { PredictionAnswerRepository } from '../repositories/PredictionAnswerRepository';
import { Service } from './Service';

export class PredictionAnswerService extends Service<PredictionAnswer, PredictionAnswerRepository> {
  constructor(repository: PredictionAnswerRepository) {
    super(repository);
  }

  async createAnswers({ predictionFormId, answers }: { predictionFormId: string, answers: Prisma.PredictionAnswerCreateManyInput[] }) {
    return await this.repository.getPrisma().$transaction(async (tx) => {
      await tx.predictionAnswer.deleteMany({
        where: {
          predictionFormId,
        },
      });

      if (answers.length > 0) {
        await tx.predictionAnswer.createMany({
          data: answers,
        });
      }
    });
  }
}