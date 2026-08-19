import type { FC, FormEvent } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ListItem } from "../../components/ui/ListItem";
import { formatCurrency } from "../../lib/format";
import { cn } from "../../lib/cn";
import { useBudget } from "./useBudget";
import { usePurchaseGoals } from "./usePurchaseGoals";

const StatTile: FC<{ label: string; value: string; valueClassName?: string }> = ({
  label,
  value,
  valueClassName,
}) => (
  <div className="flex flex-col gap-1 rounded-xl border border-border bg-background p-4">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    <span className={cn("text-xl font-bold text-foreground", valueClassName)}>{value}</span>
  </div>
);

const CurrentSavingsPage: FC = () => {
  const { income, savingsGoal, currentSavings, saveProfile } = useBudget();
  const { goals, totalAllocatedFromCurrent } = usePurchaseGoals();

  const remainingCurrentSavings = currentSavings - totalAllocatedFromCurrent;
  const allocatedGoals = goals.filter((goal) => goal.allocatedFromCurrent > 0);

  // Uncontrolled - keyed by currentSavings so the form remounts (re-reading
  // defaultValue) once the profile loads or after a save. income/savingsGoal
  // are owned by the Overview page and passed through unchanged here.
  const handleSave = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextCurrentSavings = parseFloat(form.get("currentSavings") as string) || 0;
    saveProfile(income, savingsGoal, nextCurrentSavings);
  };

  return (
    <div className="flex flex-col gap-8">
      <Card className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Current Savings" value={formatCurrency(currentSavings)} />
          <StatTile label="Allocated to Goals" value={formatCurrency(totalAllocatedFromCurrent)} />
          <StatTile
            label="Unallocated"
            value={formatCurrency(remainingCurrentSavings)}
            valueClassName={remainingCurrentSavings < 0 ? "text-danger" : undefined}
          />
        </div>

        <form
          key={currentSavings}
          onSubmit={handleSave}
          className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Current Savings</label>
            <Input
              name="currentSavings"
              type="number"
              min="0"
              step="0.01"
              defaultValue={currentSavings || ""}
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Allocated to Purchase Goals</h2>
        {allocatedGoals.length === 0 ? (
          <Card className="text-sm text-muted-foreground">
            No current savings allocated to a purchase goal yet.
          </Card>
        ) : (
          <Card className="flex flex-col gap-1 p-2">
            {allocatedGoals.map((goal) => (
              <ListItem key={goal.id}>
                <span className="text-sm font-medium text-foreground">{goal.name}</span>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(goal.allocatedFromCurrent)}
                </span>
              </ListItem>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

export default CurrentSavingsPage;
