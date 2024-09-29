// account/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Events from "./Events";
import { createClient } from "@/utils/supabase/server";
import Header from "../header/page";

export default async function AccountPage() {
  const supabase = createClient();

  // Fetch the authenticated user directly from Supabase Auth server
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    console.error("Authenticated user not found, redirecting to login.");
    redirect("/");
  }

  // Securely fetch tokens from cookies
  const provider_token = cookies().get("provider_token")?.value;
  const provider_refresh_token = cookies().get("provider_refresh_token")?.value;

  if (!provider_token || !provider_refresh_token) {
    console.error("Provider tokens not found, redirecting to login.");
    redirect("/");
  }

  console.log("Authenticated user:", userData.user);

  const fullSession = {
    access_token: userData.session?.access_token || "",
    refresh_token: userData.session?.refresh_token || "",
    provider_token,
    provider_refresh_token,
    expires_in: userData.session?.expires_in,
    token_type: userData.session?.token_type,
    user: userData.user,
  };

  return (
    <>
      <Header />
      <p>Hello {userData.user.email}</p>
      <Events session={fullSession} />
      <br />
    </>
  );
}
