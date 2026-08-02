import { PrismaClient, Role, User } from '@/generated/prisma/client';
import { Repository } from './Repository';

export class UserRepository extends Repository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma.user);
  }

  async getRole(userId: number) {
    const user = await this.modelDelegate.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    return user?.role || null;
  }

  async getAll() {
    const users = await this.modelDelegate.findMany({
      include: {
        competitor: true,
      },
    });

    return users || [];
  }

  async updateRole(targetUserId: number, newRole: Role) {
    return await this.modelDelegate.update({
      where: {
        id: targetUserId,
      },
      data: {
        role: newRole,
      }
    });
  }
}