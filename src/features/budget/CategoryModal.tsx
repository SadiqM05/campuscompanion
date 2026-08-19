import type { FC, FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import type { BudgetCategoryRecord } from "./useBudget";

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: { name: string; budgetAmount: number; description?: string }) => Promise<void>;
  initialCategory?: BudgetCategoryRecord | null;
}

// `Modal` unmounts its children entirely while closed, so this uncontrolled
// form naturally starts fresh (reading `initialCategory` via defaultValue)
// every time it opens - no state-syncing effect needed.
export const CategoryModal: FC<CategoryModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialCategory,
}) => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await onSubmit({
      name: form.get("name") as string,
      budgetAmount: parseFloat(form.get("budgetAmount") as string) || 0,
      description: (form.get("description") as string) || undefined,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={initialCategory ? "Edit Category" : "Add Category"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          name="name"
          placeholder="Category Name"
          aria-label="Category Name"
          defaultValue={initialCategory?.name ?? ""}
          required
        />
        <Input
          name="budgetAmount"
          type="number"
          min="0"
          step="0.01"
          placeholder="Budget Amount"
          aria-label="Budget Amount"
          defaultValue={initialCategory ? String(initialCategory.budgetAmount) : ""}
          required
        />
        <Input
          name="description"
          placeholder="Description (optional)"
          aria-label="Description"
          defaultValue={initialCategory?.description ?? ""}
        />
        <Button type="submit">{initialCategory ? "Save Changes" : "Add Category"}</Button>
      </form>
    </Modal>
  );
};
