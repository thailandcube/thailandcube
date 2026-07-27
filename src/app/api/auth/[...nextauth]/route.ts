import NextAuth, { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { User } from '@/model/User';

const refreshAccessToken = async (token: JWT): Promise<JWT> =>
{
    try
    {
        const response = await fetch(`${process.env.WCA_URL}/oauth/token`, 
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                method: 'POST',
                body: new URLSearchParams({
                    client_id: process.env.WCA_CLIENT_ID!,
                    client_secret: process.env.WCA_CLIENT_SECRET!,
                    grant_type: 'refresh_token',
                    refresh_token: token.refreshToken,
                }),
            }
        );

        const refreshedTokens = await response.json();

        if (!response.ok)
            throw refreshedTokens;

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            expiresAt: Date.now() + (refreshedTokens.expires_in * 1000),
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, 
        };
    }
    catch (error)
    {
        console.error('Error refreshing WCA token', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        {
            id: 'wca',
            name: 'World Cube Association',
            type: 'oauth',
            version: '2.0',
            authorization:
            {
                url: `${process.env.WCA_URL}/oauth/authorize`,
                params: 
                {
                    scope: 'public manage_competitions email dob',
                    response_type: 'code',
                },
            },
            token:
            {
                url: `${process.env.WCA_URL}/oauth/token`
            },
            userinfo: 
            {
                url: `${process.env.WCA_URL}/api/v0/me`,
            },
            clientId: process.env.WCA_CLIENT_ID!,
            clientSecret: process.env.WCA_CLIENT_SECRET!,

            idToken: false,
            checks: ['pkce', 'state'],

            profile(profile) 
            {
                return {
                    id: String(profile.me.id),
                    name: profile.me.name,
                    email: profile.me.email,
                    image: profile.me.avatar.thumb_url
                }
            },
        }
    ],

    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'wca') {
                const userId = parseInt(user.id);

                const response = await fetch(`${process.env.WCA_URL}/api/v0/users/${userId}`);

                if (!response.ok)
                    throw new Error(`Failed to fetch user: ${response.statusText}`);

                const data = await response.json();
                const userData = data.user as User;
                console.log(data);

                try 
                {
                    // 1. Ensure the base User account exists first
                    await prisma.user.upsert({
                        where: { id: userId },
                        create: { id: userId },
                        update: {} 
                    });

                    // 2. Safely link or create the Competitor profile
                    if (userData.wca_id) 
                    {
                        // If they have a WCA ID, they might already be in the database from a psych sheet.
                        // Upserting by WCA ID ensures we link their User ID without creating a duplicate.
                        await prisma.competitor.upsert({
                            where: { wcaId: userData.wca_id },
                            create: {
                                userId: userId,
                                wcaId: userData.wca_id,
                                name: userData.name,
                                region: userData.country.iso2
                            },
                            update: {
                                userId: userId, // Crucial: Links the pre-existing profile to the user
                                name: userData.name,
                                region: userData.country.iso2
                            }
                        });
                    } 
                    else 
                    {
                        // For newcomers without a WCA ID, we strictly manage them by their User ID
                        await prisma.competitor.upsert({
                            where: { userId: userId },
                            create: {
                                userId: userId,
                                name: userData.name,
                                region: userData.country.iso2
                            },
                            update: {
                                name: userData.name,
                                region: userData.country.iso2
                            }
                        });
                    }

                    return true;
                }
                catch (error)
                {
                    console.error('Error saving user to DB:', error);
                    return false;
                }
            }
            return true;
        },

        async jwt({ token, account, user }) 
        {
           if (account && user) {
                return {
                    ...token,
                    accessToken: account.access_token!,
                    refreshToken: account.refresh_token!,
                    expiresAt: Date.now() + ((account.expires_in as number) * 1000),
                    id: Number(user.id), 
                };
            }

            if (Date.now() < token.expiresAt - 300000)
                return token;

            return await refreshAccessToken(token);
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.error = token.error;
            
            if (session.user && token.id) {
                session.user.id = token.id as number;
            }

            return session;
        },
    },

    session: 
    {
        strategy: 'jwt',
    },

    debug: true,
}

const handler = NextAuth(authOptions);

export const auth = handler.auth;
export { handler as GET, handler as POST };