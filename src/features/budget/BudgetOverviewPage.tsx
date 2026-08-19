import { useState, type FC, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { ListItem } from "../../components/ui/ListItem";
import { formatCurrency } from "../../lib/format";
import { cn } from "../../lib/cn";
import { useBudget, type BudgetCategoryRecord, type CategoryStatus } from "./useBudget";
import { CategoryModal } from "./CategoryModal";
import { ExpenseModal } from "./ExpenseModal";

const statusLabels: Record<CategoryStatus, string> = {
  success: "Under Budget",
  warning: "Near Limit",
  danger: "Over Budget",
};

const statusBadgeClasses: Record<CategoryStatus, string> = {
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

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

const BudgetOverviewPage: FC = () => {
  const {
    income,
    savingsGoal,
    currentSavings,
    categories,
    expenses,
    totalAllocated,
    totalSpent,
    remainingBalance,
    savingsProgressPercent,
    saveProfile,
    addCategory,
    updateCategory,
    deleteCategory,
    addExpense,
    deleteExpense,
  } = useBudget();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategoryRecord | null>(null);

  // Uncontrolled - keying by the loaded values makes the form remount (and
  // re-read them via defaultValue) once the profile finishes fetching or
  // after a save, without syncing local state through an effect. Only
  // income/savingsGoal are edited here, so currentSavings is passed through
  // unchanged (it's owned by the Current Savings sub-page).
  const handleSaveProfile = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextIncome = parseFloat(form.get("income") as string) || 0;
    const nextSavingsGoal = parseFloat(form.get("savingsGoal") as string) || 0;
    saveProfile(nextIncome, nextSavingsGoal, currentSavings);
  };

  const openAddCategory = (): void => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategory = (category: BudgetCategoryRecord): void => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };

  const categoryNameById = (categoryId: string): string =>
    categories.find((category) => category.id === categoryId)?.name ?? "Uncategorized";

  const sortedExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-8">
      <Card className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Monthly Income" value={formatCurrency(income)} />
          <StatTile label="Allocated" value={formatCurrency(totalAllocated)} />
          <StatTile label="Spent" value={formatCurrency(totalSpent)} />
          <StatTile
            label="Remaining"
            value={formatCurrency(remainingBalance)}
            valueClassName={remainingBalance < 0 ? "text-danger" : undefined}
          />
        </div>

        {savingsGoal > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Savings Goal Progress</span>
              <span className="text-muted-foreground">
                {formatCurrency(Math.max(0, income - totalSpent))} / {formatCurrency(savingsGoal)}
              </span>
            </div>
            <ProgressBar
              percent={savingsProgressPercent}
              status={savingsProgressPercent >= 100 ? "success" : "warning"}
            />
          </div>
        )}

        <form
          key={`${income}-${savingsGoal}`}
          onSubmit={handleSaveProfile}
          className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Expected Monthly Income</label>
            <Input name="income" type="number" min="0" step="0.01" defaultValue={income || ""} />
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Savings Goal</label>
            <Input
              name="savingsGoal"
              type="number"
              min="0"
              step="0.01"
              defaultValue={savingsGoal || ""}
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Categories</h2>
          <Button variant="secondary" onClick={openAddCategory}>
            <Plus size={16} />
            Add Category
          </Button>
        </div>

        {categories.length === 0 ? (
          <Card className="text-sm text-muted-foreground">
            No categories yet. Add one to start budgeting.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id} className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openEditCategory(category)}
                      aria-label={`Edit ${category.name}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-foreground"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(category.id)}
                      aria-label={`Delete ${category.name}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <Badge className={statusBadgeClasses[category.status]}>
                  {statusLabels[category.status]}
                </Badge>

                <ProgressBar percent={category.percentUsed} status={category.status} />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(category.spent)} of {formatCurrency(category.budgetAmount)}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      category.remaining < 0 ? "text-danger" : "text-foreground"
                    )}
                  >
                    {formatCurrency(category.remaining)} left
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recent Expenses</h2>
          <Button
            onClick={() => setIsExpenseModalOpen(true)}
            disabled={categories.length === 0}
            title={categories.length === 0 ? "Add a category first" : undefined}
          >
            <Plus size={16} />
            Add Expense
          </Button>
        </div>

        {sortedExpenses.length === 0 ? (
          <Card className="text-sm text-muted-foreground">No expenses logged yet.</Card>
        ) : (
          <Card className="flex flex-col gap-1 p-2">
            {sortedExpenses.map((expense) => (
              <ListItem key={expense.id}>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {categoryNameById(expense.categoryId)}
                    {expense.note && (
                      <span className="font-normal text-muted-foreground"> · {expense.note}</span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">{expense.date}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(expense.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteExpense(expense.id)}
                    aria-label="Delete expense"
                    className="rounded-md p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-surface-hover hover:text-danger"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </ListItem>
            ))}
          </Card>
        )}
      </div>

      <CategoryModal
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        initialCategory={editingCategory}
        onSubmit={async (input) => {
          if (editingCategory) {
            await updateCategory(editingCategory.id, input);
          } else {
            await addCategory(input);
          }
        }}
      />

      <ExpenseModal
        open={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        categories={categories}
        onSubmit={addExpense}
      />
    </div>
  );
};

export default BudgetOverviewPage;
