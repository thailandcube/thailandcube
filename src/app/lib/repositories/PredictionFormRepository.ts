import { PredictionForm, PrismaClient } from '@/generated/prisma/client';
import { Repository } from './Repository';
import { AdminPredictionFormDTO, PublicPredictionFormDTO } from '../dtos/AdminPredictionFormDTO';

export class PredictionFormRepository extends Repository<PredictionForm, string> {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    super(prisma.predictionForm);
    this.prisma = prisma;
  }

  getPrisma() {
    return this.prisma;
  }

  override async getAll() {
    return await this.modelDelegate.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  override async getById(id: string, adminMode: true): Promise<AdminPredictionFormDTO | null>;
  override async getById(id: string, adminMode?: false): Promise<PublicPredictionFormDTO | null>;

  override async getById(id: string, adminMode = false) {
    if (adminMode) {
      return await this.modelDelegate.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              submissions: true,
              cubers: true,
            },
          },
          answers: true,
          cubers: true,
          submissions: {
            orderBy: {
              score: 'desc',
            },
            include: {
              user: {
                include: {
                  competitor: true,
                },
              },
              predictions: {
                include: {
                  predictedCuber: true,
                },
              },
            },
          }
        }
      });
    }
    else {
      return await this.modelDelegate.findUnique({
        where: {
          id,
        },
        include: {
          cubers: true,
        },
      });
    }
  }

  async getLeaderboardById(id: string) {
    return await this.modelDelegate.findUnique({
      where: {
        id,
      },
      include: {
        submissions: {
          orderBy: {
            score: 'desc',
          },
          include: {
            user: {
              include: {
                competitor: true,
              },
            },
            predictions: {
              include: {
                predictedCuber: true,
              },
            },
          },
        },
      },
    });
  }
}