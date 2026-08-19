import type { FC, FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import type { BudgetCategoryRecord } from "./useBudget";

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  categories: BudgetCategoryRecord[];
  onSubmit: (input: {
    categoryId: string;
    amount: number;
    note?: string;
    date: string;
  }) => Promise<void>;
}

const today = (): string => new Date().toISOString().slice(0, 10);

// `Modal` unmounts its children entirely while closed, so this uncontrolled
// form naturally starts fresh every time it opens - no reset effect needed.
export const ExpenseModal: FC<ExpenseModalProps> = ({ open, onClose, categories, onSubmit }) => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const categoryId = form.get("categoryId") as string;
    if (!categoryId) return;
    await onSubmit({
      categoryId,
      amount: parseFloat(form.get("amount") as string) || 0,
      note: (form.get("note") as string) || undefined,
      date: form.get("date") as string,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Expense">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <select
          name="categoryId"
          defaultValue={categories[0]?.id ?? ""}
          aria-label="Category"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          required
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Input
          name="amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          aria-label="Amount"
          required
        />
        <Input name="date" type="date" aria-label="Date" defaultValue={today()} required />
        <Input name="note" placeholder="Note (optional)" aria-label="Note" />
        <Button type="submit" disabled={categories.length === 0}>
          Add Expense
        </Button>
      </form>
    </Modal>
  );
};
