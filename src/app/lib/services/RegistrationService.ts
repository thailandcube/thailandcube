import { Registration, RegistrationStatus } from '@/generated/prisma/client';
import { RegistrationRepository } from '../repositories/RegistrationRepository'
import { Service } from './Service';
import { RegisterCompetitorInput } from '../dtos/RegistrationDTO';

export class RegistrationService extends Service<Registration, RegistrationRepository> {
  constructor(repository: RegistrationRepository) {
    super(repository);
  }

  private isTruthy(value: unknown): boolean {
    if (value === undefined || value === null) return false;
    const s = String(value).trim().toLowerCase();
    return s === 'true' || s === '1' || s === 'yes';
  }

  async registerNewCompetitor({ payload, competitionId, eventsInComp }: RegisterCompetitorInput) {
    return await this.repository.getPrisma().$transaction(async (tx) => {
      const normalizedWCAID = payload.wca_id?.trim() ? payload.wca_id.trim() : null;
      const targetCompetitorId = payload.competitorId?.trim() ? Number(payload.competitorId) : null;

      let targetCompetitor = null;

      if (normalizedWCAID) {
        targetCompetitor = await tx.competitor.findUnique({
          where: { wcaId: normalizedWCAID },
        });
      }

      if (!targetCompetitor && targetCompetitorId) {
        targetCompetitor = await tx.competitor.findUnique({
          where: { id: targetCompetitorId },
        });
      }

      if (targetCompetitor) {
        targetCompetitor = await tx.competitor.update({
          where: { id: targetCompetitor.id },
          data: {
            name: payload.name,
            wcaId: normalizedWCAID,
            region: payload.region ?? targetCompetitor.region,
          },
        });
      } else {
        targetCompetitor = await tx.competitor.create({
          data: {
            name: payload.name,
            wcaId: normalizedWCAID,
            region: payload.region ?? 'TH',
          },
        });
      }

      const createdRegistration = await tx.registration.upsert({
        where: {
          competitorId_competitionId: {
            competitorId: targetCompetitor.id,
            competitionId,
          },
        },
        update: { 
          status: RegistrationStatus.ACCEPTED 
        },
        create: {
          id: Number(payload.id),
          competitorId: targetCompetitor.id,
          competitionId,
          status: RegistrationStatus.ACCEPTED,
        },
      });

      const eventsToCreate = eventsInComp
        .filter((event) => this.isTruthy(payload[event.id.toString()]))
        .map((event) => ({
          registrationId: createdRegistration.id,
          eventId: event.id,
        }));

      const registeredEventIds = eventsToCreate.map((e) => e.eventId);

      await tx.registrationEvent.deleteMany({
        where: { registrationId: createdRegistration.id },
      });

      if (eventsToCreate.length > 0) {
        await tx.registrationEvent.createMany({
          data: eventsToCreate,
          skipDuplicates: true,
        });
      }

      const openFirstRounds = await tx.round.findMany({
        where: {
          eventId: { in: registeredEventIds },
          round: 1,
          open: true,
        },
      });

      const resultsToCreate = openFirstRounds.map((round) => ({
        competitorId: targetCompetitor.id,
        roundId: round.id,
      }));

      if (resultsToCreate.length > 0) {
        await tx.result.createMany({
          data: resultsToCreate,
          skipDuplicates: true,
        });
      }

      return createdRegistration;
    });
  }

  async withdrawCompetitor(competitorId: number, competitionId: string) {
    return await this.repository.getPrisma().$transaction(async (tx) => {
      await tx.result.deleteMany({
        where: {
          competitorId,
          round: {
            event: {
              competitionId,
            },
          },
        },
      });

      const deletedRegistration = await tx.registration.delete({
        where: {
          competitorId_competitionId: {
            competitorId,
            competitionId,
          },
        },
      });

      return deletedRegistration;
    })
  }
}