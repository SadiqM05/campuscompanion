import { defaultDarkModeOverride } from "@aws-amplify/ui-react";
import type { Theme } from "@aws-amplify/ui-react";

// Amplify UI components only pick up dark-mode CSS variables when a `theme`
// (not just `colorMode`) is passed to <ThemeProvider>; without it, none of
// their color tokens have dark overrides defined at all.
export const amplifyTheme: Theme = {
  name: "campus-companion-theme",
  // Matches the violet accent used across the custom Tailwind UI, so the
  // Authenticator (sign-in/sign-up) screens stay visually consistent with
  // the rest of the app.
  primaryColor: "purple",
  overrides: [defaultDarkModeOverride],
};
