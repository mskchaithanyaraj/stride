"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Track welcome messages more reliably
  const hasShownWelcome = useRef(false);
  const lastAuthTime = useRef<number>(0);
  const isEmailPasswordAuth = useRef(false);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Only show welcome for OAuth (Google) sign-in, not email/password
      // and only if it's a recent sign-in (not browser focus/blur)
      if (
        event === "SIGNED_IN" &&
        session?.user &&
        !isEmailPasswordAuth.current && // Not email/password auth
        Date.now() - lastAuthTime.current < 30000 // Within 30 seconds of auth attempt
      ) {
        toast.success(
          `Welcome ${
            session.user.user_metadata?.first_name ||
            session.user.email?.split("@")[0] ||
            "User"
          }!`
        );
      }

      // Only show toast for sign-out events
      if (event === "SIGNED_OUT") {
        toast.success("Signed out successfully");
        hasShownWelcome.current = false;
        isEmailPasswordAuth.current = false;
      }

      // Reset email/password flag after auth state change
      if (event === "SIGNED_IN") {
        setTimeout(() => {
          isEmailPasswordAuth.current = false;
        }, 1000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mark this as email/password auth and record timestamp
    isEmailPasswordAuth.current = true;
    lastAuthTime.current = Date.now();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Show welcome toast only for email/password sign-in
    if (!error && data.user) {
      toast.success(
        `Welcome back ${
          data.user.user_metadata?.first_name ||
          data.user.email?.split("@")[0] ||
          "User"
        }!`
      );
    }

    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    return { error };
  };

  const signInWithGoogle = async () => {
    // Record timestamp for OAuth auth
    lastAuthTime.current = Date.now();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/overview");
    }
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
