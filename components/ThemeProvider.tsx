"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

interface Props {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: Props) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange={false}
      themes={["light", "dark"]}
      storageKey="stride-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
