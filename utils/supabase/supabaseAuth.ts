import { createClient } from "./server";
import { Session } from "@supabase/supabase-js";

export async function refreshAccessToken(
  session: Session,
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.refreshSession(session);

  if (error) {
    console.error("Error refreshing token:", error);
    return null;
  }

  return data.session?.provider_token || null;
}
