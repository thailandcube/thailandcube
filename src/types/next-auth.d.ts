import { Role } from '@/generated/prisma/enums';
import NextAuth, { DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    error?: 'RefreshAccessTokenError'
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: Role | null;
    } & Omit<DefaultSession['user'], 'id'>;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: 'RefreshAccessTokenError';
    id?: string;
    role?: Role | null;
  }
}