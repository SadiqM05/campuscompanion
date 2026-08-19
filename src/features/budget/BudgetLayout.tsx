import type { FC } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "../../lib/cn";

const tabs = [
  { to: "/budget", label: "Overview", end: true },
  { to: "/budget/goals", label: "Purchase Goals", end: false },
  { to: "/budget/savings", label: "Current Savings", end: false },
];

const BudgetLayout: FC = () => (
  <div className="flex flex-col gap-6">
    <h1 className="text-2xl font-bold text-foreground">Budget</h1>

    <nav className="inline-flex w-fit rounded-lg border border-border bg-surface p-1">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors duration-150",
              isActive ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground"
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>

    <Outlet />
  </div>
);

export default BudgetLayout;
