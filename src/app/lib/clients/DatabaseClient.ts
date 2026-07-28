/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@/generated/prisma/client';

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export class DatabaseClient {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      if (process.env.NODE_ENV === 'production') {
        DatabaseClient.instance = new PrismaClient({} as any);
      } else {
        if (!globalThis.prismaGlobal) {
          globalThis.prismaGlobal = new PrismaClient({} as any);
        }
        DatabaseClient.instance = globalThis.prismaGlobal;
      }
    }

    return DatabaseClient.instance;
  }
}