'use server';

import { Role } from '@/generated/prisma/enums';
import { PermissionError } from '../lib/errors/PermissionError';
import { userService } from '../lib/services/instances';
import { auth } from '@/auth';

/**
 * Fetches user's role by their WCA account ID (not WCA ID).
 * @param userId The WCA account ID of the user.
 */
export async function getUserRole(userId: string | number) {
  try {
    const parsedId = typeof userId === 'string' ? parseInt(userId, 10) : userId;

    return await userService.getRole(parsedId);
  } 
  catch (error) {
    console.error('Failed to fetch role in action:', error);
    return null;
  }
}

/**
 * Fetches all users in the database.
 */
export async function getAllUsers() {
  try {
    return await userService.getAll();
  }
  catch (error) {
    console.error('Failed to fetch all users in action:', error);
    return [];
  }
}

/**
 * Fetches user's role by their WCA account ID (not WCA ID).
 * @param targetUserId The WCA account ID of the target user to update.
 * @param newRole New Role enum to update.
 */
export async function updateUserRole(targetUserId: number, newRole: Role) {
  try {
    const session = await auth();

    if (!session?.user)
      return { success: false, error: 'Not authenticated' };

    await userService.updateRole(Number.parseInt(session.user.id, 10), targetUserId, newRole);

    return { success: true, message: 'Role updated' };
  }
  catch (error) {
    if (error instanceof PermissionError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Internal Server Error' };
  }
}