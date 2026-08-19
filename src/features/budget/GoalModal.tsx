import type { FC, FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import type { GoalInput, PurchaseGoalRecord } from "./usePurchaseGoals";

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: GoalInput) => Promise<void>;
  initialGoal?: PurchaseGoalRecord | null;
}

// `Modal` unmounts its children entirely while closed, so this uncontrolled
// form naturally starts fresh (reading `initialGoal` via defaultValue) every
// time it opens - no state-syncing effect needed.
export const GoalModal: FC<GoalModalProps> = ({ open, onClose, onSubmit, initialGoal }) => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await onSubmit({
      name: form.get("name") as string,
      targetAmount: parseFloat(form.get("targetAmount") as string) || 0,
      description: (form.get("description") as string) || undefined,
      deadline: (form.get("deadline") as string) || undefined,
      allocatedFromCurrent: parseFloat(form.get("allocatedFromCurrent") as string) || 0,
      allocatedFromMonthly: parseFloat(form.get("allocatedFromMonthly") as string) || 0,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initialGoal ? "Edit Purchase Goal" : "Add Purchase Goal"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="name"
          placeholder="Goal Name (e.g. MacBook Pro)"
          aria-label="Goal Name"
          defaultValue={initialGoal?.name ?? ""}
          required
        />
        <Input
          name="targetAmount"
          type="number"
          min="0"
          step="0.01"
          placeholder="Target Amount"
          aria-label="Target Amount"
          defaultValue={initialGoal ? String(initialGoal.targetAmount) : ""}
          required
        />
        <Input
          name="description"
          placeholder="Description (optional)"
          aria-label="Description"
          defaultValue={initialGoal?.description ?? ""}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Deadline (optional)</label>
          <Input name="deadline" type="date" aria-label="Deadline" defaultValue={initialGoal?.deadline ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">From Current Savings</label>
            <Input
              name="allocatedFromCurrent"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initialGoal ? String(initialGoal.allocatedFromCurrent) : "0"}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">From Monthly Savings</label>
            <Input
              name="allocatedFromMonthly"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initialGoal ? String(initialGoal.allocatedFromMonthly) : "0"}
            />
          </div>
        </div>
        <Button type="submit">{initialGoal ? "Save Changes" : "Add Goal"}</Button>
      </form>
    </Modal>
  );
};
