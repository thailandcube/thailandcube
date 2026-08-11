/* eslint-disable @typescript-eslint/no-explicit-any */
import { PredictionForm } from '@/generated/prisma/client';
import { Service } from './Service';
import { PredictionFormRepository } from '../repositories/PredictionFormRepository';
import { EventCodeToPrismaMap } from '@/app/utils/EnumMapper';
import { CuberData } from '@/types/predictions/CuberData';
import { AdminPredictionFormDTO, PublicPredictionFormDTO } from '../dtos/AdminPredictionFormDTO';

export class PredictionFormService extends Service<PredictionForm, PredictionFormRepository, PredictionForm, string> {
  constructor(repository: PredictionFormRepository) {
    super(repository);
  }

  async createFormWithCompetitors(payload: Partial<PredictionForm>, allRegisteredCubers: Record<string, CuberData[]>) {
    return await this.repository.getPrisma().$transaction(async (tx) => {
      const form = await tx.predictionForm.create({
        data: {
          id: payload.id!,
          name: payload.name!,
          isThaiOnly: Boolean(payload.isThaiOnly),
          openTime: new Date(payload.openTime!),
          closeTime: new Date(payload.closeTime!),
        }
      });

      const competitorInserts = [];

      for (const [eventId, cubers] of Object.entries(allRegisteredCubers)) {
        const prismaEvent = EventCodeToPrismaMap[eventId as keyof typeof EventCodeToPrismaMap];

        if (!prismaEvent)
          continue;

        for (const cuber of cubers) {
          competitorInserts.push({
            predictionFormId: form.id,
            name: cuber.name,
            wcaId: cuber.wcaId,
            countryIso2: cuber.countryIso2,
            event: prismaEvent,
            pos: cuber.pos ?? 999,
          });
        }
      }

      if (competitorInserts.length > 0) {
        await tx.predictionEventCompetitor.createMany({
          data: competitorInserts,
          skipDuplicates: true 
        });
      }

      return form;
    });
  }

  override async getById(id: string, adminMode: true): Promise<AdminPredictionFormDTO>;
  override async getById(id: string, adminMode?: false): Promise<PublicPredictionFormDTO>;

  override async getById(id: string, adminMode = false): Promise<any> {
    const record = await this.repository.getById(id, adminMode as any);

    if (!record)
      throw new Error('Prediction form not found');

    return record;
  }
}