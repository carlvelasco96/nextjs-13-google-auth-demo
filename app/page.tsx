import { GOOGLE_SCOPES, authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { google } from "googleapis";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + "/api/auth/callback/google"
    );

    oauth2Client.setCredentials({
      refresh_token: session.refreshToken,
      access_token: session.accessToken,
      token_type: "Bearer",
      id_token: session.idToken,
      scope: GOOGLE_SCOPES.join(" "),
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const files = await drive.files.list({
      pageSize: 10,
      fields: "nextPageToken, files(id, name)",
    });
    console.log(files.data.files);

    return <a href="/api/auth/signout">Sign out</a>;
  }

  return <a href="/api/auth/signin">Authenticate</a>;
}
