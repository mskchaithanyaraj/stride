import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const next = searchParams.get("next") ?? "/home";

  // If there's an explicit error from the OAuth provider
  if (error) {
    console.error("OAuth provider error:", error);
    return Response.redirect(`${origin}/auth/auth-code-error`);
  }

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_SUPABASE_ANON_KEY!
    );

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // Authentication successful - redirect to destination
        return Response.redirect(`${origin}${next}`);
      }

      // Only show error if there's actually an error
      if (error) {
        console.error("Auth exchange error:", error);
        return Response.redirect(`${origin}/auth/auth-code-error`);
      }
    } catch (err) {
      console.error("Unexpected auth error:", err);
      return Response.redirect(`${origin}/auth/auth-code-error`);
    }
  }

  // No code parameter - this might be a direct access to callback URL
  // Redirect to login instead of error page
  return Response.redirect(`${origin}/login`);
}
