import { Role, User } from '@/generated/prisma/client';
import { UserRepository } from '../repositories/UserRepository';
import { PermissionError } from '../errors/PermissionError';
import { Service } from './Service';

export class UserService extends Service<User, UserRepository> {
  constructor(repository: UserRepository) {
    super(repository);
  }

  async getAll() {
    return await this.repository.getAll();
  }

  async getRole(userId: number) {
    if (userId === undefined || userId === null)
      throw new Error('Missing user ID');

    return await this.repository.getRole(userId);
  }
  
  async updateRole(actorUserId: number, targetUserId: number, newRole: Role) {
    const actorRole = await this.repository.getRole(actorUserId);

    if (actorRole !== 'SUPERUSER') 
      throw new PermissionError('Only superusers can edit roles.');

    return await this.repository.updateRole(targetUserId, newRole);
  }
}