import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export class DatabaseClient {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
      });

      if (process.env.NODE_ENV === 'production') {
        DatabaseClient.instance = new PrismaClient({ adapter });
      } else {
        if (!globalThis.prismaGlobal) {
          globalThis.prismaGlobal = new PrismaClient({ adapter });
        }
        DatabaseClient.instance = globalThis.prismaGlobal;
      }
    }

    return DatabaseClient.instance;
  }
}