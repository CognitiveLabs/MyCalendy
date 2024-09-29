import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { type CookieOptions, createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account"; // Default redirect to account page

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      },
    );

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Exchange code for session error:", error);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }

    const session = data.session;
    console.log("Session:", session); // Log session for debugging

    // Check if tokens are available before setting them in cookies
    if (session.provider_token) {
      cookieStore.set("provider_token", session.provider_token, {
        httpOnly: true,
      });
    }

    if (session.provider_refresh_token) {
      cookieStore.set(
        "provider_refresh_token",
        session.provider_refresh_token,
        { httpOnly: true },
      );
    }

    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
    } catch (error) {
      console.error("Error in early sign-up process:", error);
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
