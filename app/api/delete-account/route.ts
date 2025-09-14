import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

// Server-side Supabase client with service role key
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Regular client for session verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { error: "Unauthorized - No access token provided" },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);

    // Verify the access token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return Response.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Delete user data from trackers table
    const { error: trackersError } = await supabaseServiceRole
      .from("trackers")
      .delete()
      .eq("user_id", userId);

    if (trackersError) {
      console.error("Error deleting tracker data:", trackersError);
      // Continue with account deletion even if tracker deletion fails
    }

    // Delete the user account from auth system
    const { error: deleteError } =
      await supabaseServiceRole.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting user account:", deleteError);
      return Response.json(
        { error: "Failed to delete account", details: deleteError.message },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Account deletion error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
