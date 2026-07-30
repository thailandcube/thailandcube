/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { DatabaseClient } from '@/app/lib/clients/DatabaseClient';
import type { User } from '@/types/User';
import { getUserRole } from './app/actions/users';

// TODO: Add roles to JWT and session

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  try {
    const response = await fetch(`${process.env.WCA_URL}/oauth/token`, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.WCA_CLIENT_ID!,
        client_secret: process.env.WCA_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) throw refreshedTokens;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing WCA token', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  basePath: '/api/auth',
  providers: [
    {
      id: 'wca',
      name: 'World Cube Association',
      type: 'oauth',
      // version: '2.0',
      authorization: {
        url: `${process.env.WCA_URL}/oauth/authorize`,
        params: {
          scope: 'public manage_competitions email dob',
          response_type: 'code',
        },
      },
      token: {
        url: `${process.env.WCA_URL}/oauth/token`,
      },
      userinfo: {
        url: `${process.env.WCA_URL}/api/v0/me`,
      },
      clientId: process.env.WCA_CLIENT_ID!,
      clientSecret: process.env.WCA_CLIENT_SECRET!,
      // idToken: false,
      checks: ['pkce', 'state'],
      profile(profile: any) {
        return {
          id: String(profile.me.id),
          name: profile.me.name,
          email: profile.me.email,
          image: profile.me.avatar.thumb_url,
        };
      },
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'wca') {
        const wcaProfile = profile as any;
        const userId = parseInt(wcaProfile.me.id, 10);

        const response = await fetch(`${process.env.WCA_URL}/api/v0/users/${userId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.statusText}`);
        }

        const data = await response.json();
        const userData = data.user as User;
        
        console.log(data);

        const prisma = DatabaseClient.getInstance();

        try {
          await prisma.user.upsert({
            where: { id: userId },
            create: { id: userId },
            update: {},
          });

          if (userData.wca_id) {
            await prisma.competitor.upsert({
              where: { wcaId: userData.wca_id },
              create: {
                userId: userId,
                wcaId: userData.wca_id,
                name: userData.name,
                region: userData.country.iso2,
              },
              update: {
                userId: userId,
                name: userData.name,
                region: userData.country.iso2,
              },
            });
          } 
          else {
            await prisma.competitor.upsert({
              where: { userId: userId },
              create: {
                userId: userId,
                name: userData.name,
                region: userData.country.iso2,
              },
              update: {
                name: userData.name,
                region: userData.country.iso2,
              },
            });
          }

          return true;
        } 
        catch (err) {
          console.error('Error saving user to DB:', err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, account, user, profile }) {
      if (account && user) {
        const wcaProfile = profile as any;
        const wcaUserId = wcaProfile?.me?.id ? String(wcaProfile.me.id) : String(user.id);
        const userRole = await getUserRole(wcaUserId);

        return {
          ...token,
          accessToken: account.access_token!,
          refreshToken: account.refresh_token!,
          expiresAt: Date.now() + (account.expires_in as number) * 1000,
          id: wcaUserId,
          role: userRole,
        };
      }

      if (Date.now() < (token.expiresAt as number) - 300000) {
        return token;
      }

      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;

      if (session.user && token.id) {
        session.user.id = token.id; 
        session.user.role = token.role;
      }

      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  debug: true,
});