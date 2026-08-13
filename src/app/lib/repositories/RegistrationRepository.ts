import { PrismaClient, Registration } from '@/generated/prisma/client';
import { Repository } from './Repository';

export class RegistrationRepository extends Repository<Registration> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super(prisma.registration);

    this.prisma = prisma;
  }

  getPrisma() {
    return this.prisma;
  }

  async deleteCompetitorRegistrationFromCompetition(competitorId: number, competitionId: string) {
    return await this.modelDelegate.delete({
      where: {
        competitorId_competitionId: {
          competitorId,
          competitionId,
        },
      },
    });
  }
}