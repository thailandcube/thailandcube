import { PrismaClient } from '@/generated/prisma/client';

export class UserRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma; 
  }

  async getRole(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    return user?.role || null;
  }
}