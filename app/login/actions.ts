"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login() {
  const supabase = createClient();

  // Initiate Google OAuth sign-in with additional query parameters for refresh token
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      scopes:
        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.events.owned",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Login error:", error);
    redirect("/error");
  }

  if (data.url) {
    redirect(data.url); // Redirect to the Google OAuth URL
  }
}

export async function signup() {
  const supabase = createClient();

  // Initiate Google OAuth sign-up with additional query parameters for refresh token
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      scopes:
        "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.events.owned",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Signup error:", error);
    redirect("/error");
  }

  if (data.url) {
    redirect(data.url); // Redirect to the Google OAuth URL
  }
}
