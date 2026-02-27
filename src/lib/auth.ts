import NextAuth, { type AuthOptions } from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
    providers: [
        LinkedInProvider({
            clientId: process.env.LINKEDIN_CLIENT_ID ?? "",
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email || !user.id) return true;

            // Sync user to DB on sign in
            const { upsertUser } = await import("./actions");
            await upsertUser({
                id: user.id,
                email: user.email,
                name: user.name ?? "Anonymous",
                // We don't want to overwrite the role if they already have one
                // Role is handled in settings, but we can default it on first sign in
            });
            return true;
        },
        async session({ session, token }) {
            if (session?.user) {
                (session.user as { id?: string }).id = token.sub;
            }
            return session;
        },
    },
};

export default NextAuth(authOptions);
