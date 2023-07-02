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

    if (!!files.data.files) {
      if (files.data.files.length > 0) {
        const docs = google.docs({ version: "v1", auth: oauth2Client });
        const doc = await docs.documents.get({
          documentId: files.data.files[0].id ?? "",
        });
        console.log(doc.data.title);
        if (!!doc.data.body?.content) {
          console.log(doc.data.body?.content[1].paragraph?.elements);
        }
      }
    }

    return <a href="/api/auth/signout">Sign out</a>;
  }

  return <a href="/api/auth/signin">Authenticate</a>;
}
