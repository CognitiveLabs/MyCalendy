import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// import AddEvent from "./AddEvent";
import Events from "./Events";
import { createClient } from "@/utils/supabase/server";

export default async function AccountPage() {
  const supabase = createClient();
  const { data: session } = await supabase.auth.getSession();

  if (!session) {
    console.error("Session not found, redirecting to login.");
    redirect("/");
  }

  const provider_token = cookies().get("provider_token")?.value;
  const provider_refresh_token = cookies().get("provider_refresh_token")?.value;

  if (!provider_token || !provider_refresh_token) {
    console.error("Provider tokens not found, redirecting to login.");
    redirect("/");
  }

  console.log("Session data:", session); // Log session data for debugging

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/");
  }

  return (
    <>
      <p>Hello {data.user.email}</p>
      <Events session={{ provider_token, provider_refresh_token }} />
      <br />
    </>
  );
}
