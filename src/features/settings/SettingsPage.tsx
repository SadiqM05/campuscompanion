import type { FC } from "react";
import { useTheme } from "../../hooks/useTheme";
import type { ThemePreference } from "../../context/ThemeContext";
import { Card } from "../../components/ui/Card";
import { cn } from "../../lib/cn";

const themeOptions: { value: ThemePreference; label: string }[] = [
  { value: "LIGHT", label: "Light" },
  { value: "DARK", label: "Dark" },
  { value: "SYSTEM", label: "System" },
];

const SettingsPage: FC = () => {
  const { preference, setPreference } = useTheme();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <Card>
        <h2 className="mb-1 text-sm font-semibold text-foreground">Theme</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Choose how Campus Companion looks on this account.
        </p>
        <div className="inline-flex rounded-lg border border-border bg-background p-1">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreference(option.value)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors duration-150",
                preference === option.value
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
