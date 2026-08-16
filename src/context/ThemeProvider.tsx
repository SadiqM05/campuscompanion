import { useCallback, useEffect, useState, type FC, type ReactNode } from "react";
import { client } from "../lib/amplifyClient";
import { ThemeContext, type ResolvedTheme, type ThemePreference } from "./ThemeContext";

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

// Mount this only once the user is authenticated (owner-scoped UserPreference
// records require an authenticated identity).
export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [preference, setPreferenceState] = useState<ThemePreference>("SYSTEM");
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  const resolvedTheme: ResolvedTheme =
    preference === "SYSTEM" ? systemTheme : preference === "DARK" ? "dark" : "light";

  // Load the signed-in user's saved preference from Amplify on mount.
  useEffect(() => {
    const loadPreference = async (): Promise<void> => {
      const { data: preferences } = await client.models.UserPreference.list();
      const existing = preferences[0];
      if (existing?.theme) {
        setPreferenceId(existing.id);
        setPreferenceState(existing.theme);
      }
    };
    loadPreference();
  }, []);

  // Track OS-level theme changes while the preference is SYSTEM.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (): void => setSystemTheme(media.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // Reflect the resolved theme on <html> so plain CSS can react to it.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  const setPreference = useCallback(
    async (next: ThemePreference): Promise<void> => {
      setPreferenceState(next);
      if (preferenceId) {
        await client.models.UserPreference.update({ id: preferenceId, theme: next });
      } else {
        const { data: created } = await client.models.UserPreference.create({
          theme: next,
        });
        if (created) setPreferenceId(created.id);
      }
    },
    [preferenceId]
  );

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};
