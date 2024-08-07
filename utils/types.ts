import { Session } from "@supabase/supabase-js";

declare global {
  function refreshAccessToken(session: Session): Promise<string>;
}

export {};
