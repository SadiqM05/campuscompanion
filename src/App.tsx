import type { FC } from "react";
import { Authenticator, ThemeProvider as AmplifyThemeProvider } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import outputs from "../amplify_outputs.json";
import { ThemeProvider } from "./context/ThemeProvider";
import { useTheme } from "./hooks/useTheme";
import Layout from "./components/layout/Layout";
import BudgetLayout from "./features/budget/BudgetLayout";
import BudgetOverviewPage from "./features/budget/BudgetOverviewPage";
import PurchaseGoalsPage from "./features/budget/PurchaseGoalsPage";
import CurrentSavingsPage from "./features/budget/CurrentSavingsPage";
import NotesPage from "./features/notes/NotesPage";
import PomodoroPage from "./features/pomodoro/PomodoroPage";
import SettingsPage from "./features/settings/SettingsPage";
import { amplifyTheme } from "./theme/amplifyTheme";

Amplify.configure(outputs);

interface ThemedAppProps {
  signOut?: () => void;
}

// Wrapped separately so useTheme() (which needs ThemeProvider above it) can
// drive Amplify UI's own colorMode, keeping Authenticator/Button/etc. in sync
// with the rest of the app's light/dark styling.
const ThemedApp: FC<ThemedAppProps> = ({ signOut }) => {
  const { resolvedTheme } = useTheme();

  return (
    <AmplifyThemeProvider theme={amplifyTheme} colorMode={resolvedTheme}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout signOut={signOut} />}>
            <Route index element={<Navigate to="/notes" replace />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="pomodoro" element={<PomodoroPage />} />
            <Route path="budget" element={<BudgetLayout />}>
              <Route index element={<BudgetOverviewPage />} />
              <Route path="goals" element={<PurchaseGoalsPage />} />
              <Route path="savings" element={<CurrentSavingsPage />} />
            </Route>
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AmplifyThemeProvider>
  );
};

// ThemeProvider is mounted only once authenticated, since the UserPreference
// records it syncs are owner-scoped and require a signed-in identity.
const App: FC = () => (
  <Authenticator>
    {({ signOut }) => (
      <ThemeProvider>
        <ThemedApp signOut={signOut} />
      </ThemeProvider>
    )}
  </Authenticator>
);

export default App;
