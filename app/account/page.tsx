import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Events from "./Events";
import { createClient } from "@/utils/supabase/server";
import Header from "../header/page";

export default async function AccountPage() {
  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData?.session) {
    console.error("Session not found, redirecting to login.");
    redirect("/");
  }

  const session = sessionData.session;

  const provider_token = cookies().get("provider_token")?.value;
  const provider_refresh_token = cookies().get("provider_refresh_token")?.value;

  if (!provider_token || !provider_refresh_token) {
    console.error("Provider tokens not found, redirecting to login.");
    redirect("/");
  }

  console.log("Session data:", session);

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/");
  }

  const fullSession = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    provider_token,
    provider_refresh_token,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  };

  return (
    <>
      <Header />
      <p>Hello {data.user.email}</p>
      <Events session={fullSession} />
      <br />
    </>
  );
}
