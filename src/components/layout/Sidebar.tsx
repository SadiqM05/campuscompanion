import type { FC } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Notebook, Settings as SettingsIcon, Timer, Wallet } from "lucide-react";
import { cn } from "../../lib/cn";

interface SidebarProps {
  signOut?: () => void;
}

const navItems = [
  { to: "/notes", label: "Notes", icon: Notebook },
  { to: "/pomodoro", label: "Pomodoro", icon: Timer },
  { to: "/budget", label: "Budget", icon: Wallet },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export const Sidebar: FC<SidebarProps> = ({ signOut }) => (
  <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface p-4">
    <div className="mb-6 px-2 text-lg font-bold text-foreground">Campus Companion</div>
    <nav className="flex flex-1 flex-col gap-1">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
              isActive
                ? "bg-accent/15 text-accent"
                : "text-foreground hover:bg-surface-hover"
            )
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
    <button
      type="button"
      onClick={signOut}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-foreground"
    >
      <LogOut size={18} />
      Sign Out
    </button>
  </aside>
);
