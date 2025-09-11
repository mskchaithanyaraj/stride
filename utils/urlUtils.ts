/**
 * Environment-based URL utilities
 * Automatically switches between development and production URLs
 */

// Get the base URL of the application
export function getBaseURL(): string {
  // Check if we're running in a browser environment
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server-side: use environment variables
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fallback for development
  return "http://localhost:3000";
}

// Get the site URL (for meta tags, SEO, etc.)
export function getSiteURL(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || getBaseURL();
}

// Get the auth callback URL
export function getAuthCallbackURL(): string {
  return `${getBaseURL()}/auth/callback`;
}

// Get the full URL for a given path
export function getFullURL(path: string): string {
  const base = getBaseURL();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

// Check if we're in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

// Check if we're in development
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

// Get environment-specific values
export function getEnvValue<T>(devValue: T, prodValue: T): T {
  return isProduction() ? prodValue : devValue;
}
