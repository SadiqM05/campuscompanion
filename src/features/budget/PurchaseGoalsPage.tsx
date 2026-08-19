import { useState, type FC } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { formatCurrency } from "../../lib/format";
import { usePurchaseGoals, type PurchaseGoalRecord } from "./usePurchaseGoals";
import { GoalModal } from "./GoalModal";

const PurchaseGoalsPage: FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = usePurchaseGoals();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PurchaseGoalRecord | null>(null);

  const openAddGoal = (): void => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const openEditGoal = (goal: PurchaseGoalRecord): void => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Purchase Goals</h2>
        <Button onClick={openAddGoal}>
          <Plus size={16} />
          Add Purchase Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card className="text-sm text-muted-foreground">
          No purchase goals yet. Add one to start saving toward something.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{goal.name}</h3>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEditGoal(goal)}
                    aria-label={`Edit ${goal.name}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-foreground"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteGoal(goal.id)}
                    aria-label={`Delete ${goal.name}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-danger"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  className={
                    goal.status === "complete"
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-accent/30 bg-accent/10 text-accent"
                  }
                >
                  {goal.status === "complete" ? "Goal Reached" : "In Progress"}
                </Badge>
                {goal.deadline && <Badge>Due {goal.deadline}</Badge>}
              </div>

              <ProgressBar
                percent={goal.progressPercent}
                status={goal.status === "complete" ? "success" : "accent"}
              />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatCurrency(goal.totalAllocated)} of {formatCurrency(goal.targetAmount)}
                </span>
                <span className="font-medium text-foreground">
                  {goal.remaining > 0 ? `${formatCurrency(goal.remaining)} to go` : "Fully funded"}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <GoalModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialGoal={editingGoal}
        onSubmit={async (input) => {
          if (editingGoal) {
            await updateGoal(editingGoal.id, input);
          } else {
            await addGoal(input);
          }
        }}
      />
    </div>
  );
};

export default PurchaseGoalsPage;
