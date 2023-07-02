import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/documents",
];

type TGoogleAccount = {
  provider: "google";
  type: "oauth";
  providerAccountId: string;
  access_token: string;
  expires_at: number;
  refresh_token: string;
  scope: string;
  token_type: "Bearer";
  id_token: string;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: GOOGLE_SCOPES.join(" "),
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "google") {
        console.log("account", account);
        const { access_token, id_token, refresh_token } =
          account as TGoogleAccount;
        if (access_token) token.accessToken = access_token;
        if (id_token) token.idToken = id_token;
        if (refresh_token) token.refreshToken = refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      return session;
    },
  },
};
