import { Prisma } from '@/generated/prisma/client';

export type AdminPredictionFormDTO = Prisma.PredictionFormGetPayload<{
  include: {
    _count: {
      select: {
        submissions: true;
        cubers: true;
      };
    };
    answers: true;
    cubers: true;
    submissions: {
      orderBy: {
        score: 'desc';
      };
      include: {
        user: {
          include: {
            competitor: true;
          };
        };
        predictions: {
          include: {
            predictedCuber: true;
          };
        };
      };
    };
  };
}>;

export type PublicPredictionFormDTO = Prisma.PredictionFormGetPayload<{
  include: {
    cubers: true;
  };
}>;