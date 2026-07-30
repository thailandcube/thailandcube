'use server';

import { DatabaseClient } from '../lib/clients/DatabaseClient';
import { UserRepository } from '../lib/repositories/UserRepository';
import { UserService } from '../lib/services/UserService';

const prisma = DatabaseClient.getInstance();
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);

export async function getUserRole(userId: string | number) {
  try {
    const parsedId = typeof userId === 'string' ? parseInt(userId, 10) : userId;

    const role = await userService.getRole(parsedId);
    return role;
  } 
  catch (error) {
    console.error('Failed to fetch role in action:', error);
    return null;
  }
}