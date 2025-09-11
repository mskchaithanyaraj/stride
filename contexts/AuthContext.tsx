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

  // Track last welcome message to prevent duplicates
  const lastWelcomeUserId = useRef<string | null>(null);
  const isInitialAuth = useRef(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Mark initial auth as complete after first session check
      setTimeout(() => {
        isInitialAuth.current = false;
      }, 1000);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Only show welcome toast for OAuth sign-in (after initial auth period)
      // and prevent duplicate messages
      if (
        event === "SIGNED_IN" &&
        session?.user &&
        !isInitialAuth.current &&
        lastWelcomeUserId.current !== session.user.id
      ) {
        toast.success(
          `Welcome ${
            session.user.user_metadata?.first_name ||
            session.user.email?.split("@")[0] ||
            "User"
          }!`
        );
        lastWelcomeUserId.current = session.user.id;
      }

      // Only show toast for sign-out events
      if (event === "SIGNED_OUT") {
        toast.success("Signed out successfully");
        lastWelcomeUserId.current = null; // Reset on sign out
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Show welcome toast only for email/password sign-in
    // and prevent duplicate from onAuthStateChange
    if (!error && data.user) {
      lastWelcomeUserId.current = data.user.id; // Mark as welcomed
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
