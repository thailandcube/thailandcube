'use server';

import { DatabaseClient } from '../lib/clients/DatabaseClient';
import { UserRepository } from '../lib/repositories/UserRepository';
import { UserService } from '../lib/services/UserService';

const prisma = DatabaseClient.getInstance();
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);

export async function getUserRole(userId: number) {
  try {
    const role = await userService.getRole(userId);
    return role;
  } 
  catch (error) {
    console.error('Failed to fetch role in action:', error);
    return null;
  }
}