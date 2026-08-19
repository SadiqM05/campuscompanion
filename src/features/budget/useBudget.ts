import { useCallback, useEffect, useState } from "react";
import { client } from "../../lib/amplifyClient";
import type { Schema } from "../../../amplify/data/resource";

export interface BudgetCategoryRecord {
  id: string;
  name: string;
  budgetAmount: number;
  description: string | null;
}

export interface ExpenseRecord {
  id: string;
  categoryId: string;
  amount: number;
  note: string | null;
  date: string;
}

export type CategoryStatus = "success" | "warning" | "danger";

export interface CategoryWithSpending extends BudgetCategoryRecord {
  spent: number;
  remaining: number;
  percentUsed: number;
  status: CategoryStatus;
}

const statusForPercent = (percent: number): CategoryStatus => {
  if (percent >= 100) return "danger";
  if (percent >= 80) return "warning";
  return "success";
};

interface UseBudgetResult {
  income: number;
  savingsGoal: number;
  currentSavings: number;
  categories: CategoryWithSpending[];
  expenses: ExpenseRecord[];
  totalAllocated: number;
  totalSpent: number;
  remainingBalance: number;
  savingsProgressPercent: number;
  saveProfile: (income: number, savingsGoal: number, currentSavings: number) => Promise<void>;
  addCategory: (input: { name: string; budgetAmount: number; description?: string }) => Promise<void>;
  updateCategory: (
    id: string,
    input: { name: string; budgetAmount: number; description?: string }
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addExpense: (input: {
    categoryId: string;
    amount: number;
    note?: string;
    date: string;
  }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

// Shared across the Budget feature's sub-pages (Overview, Purchase Goals,
// Current Savings) - all read/write the same singleton BudgetProfile record.
export const useBudget = (): UseBudgetResult => {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [income, setIncome] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [categories, setCategories] = useState<BudgetCategoryRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);

  const fetchAll = useCallback(async (): Promise<void> => {
    const [{ data: profiles }, { data: categoryRecords }, { data: expenseRecords }] =
      await Promise.all([
        client.models.BudgetProfile.list(),
        client.models.BudgetCategory.list(),
        client.models.Expense.list(),
      ]);

    const profile = profiles[0];
    if (profile) {
      setProfileId(profile.id);
      setIncome(profile.expectedMonthlyIncome ?? 0);
      setSavingsGoal(profile.savingsGoal ?? 0);
      setCurrentSavings(profile.currentSavings ?? 0);
    }

    setCategories(
      categoryRecords.map((category) => ({
        id: category.id,
        name: category.name,
        budgetAmount: category.budgetAmount,
        description: category.description ?? null,
      }))
    );
    setExpenses(
      expenseRecords.map((expense) => ({
        id: expense.id,
        categoryId: expense.categoryId,
        amount: expense.amount,
        note: expense.note ?? null,
        date: expense.date,
      }))
    );
  }, []);

  useEffect(() => {
    // Standard fetch-on-mount; fetchAll is also reused after every mutation
    // to refresh state, so it stays a standalone function rather than an
    // inline effect body (which is what this rule expects).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  const saveProfile = useCallback(
    async (nextIncome: number, nextSavingsGoal: number, nextCurrentSavings: number): Promise<void> => {
      if (profileId) {
        await client.models.BudgetProfile.update({
          id: profileId,
          expectedMonthlyIncome: nextIncome,
          savingsGoal: nextSavingsGoal,
          currentSavings: nextCurrentSavings,
        } as unknown as Schema["BudgetProfile"]["updateType"]);
      } else {
        const { data: created } = await client.models.BudgetProfile.create({
          expectedMonthlyIncome: nextIncome,
          savingsGoal: nextSavingsGoal,
          currentSavings: nextCurrentSavings,
        } as unknown as Schema["BudgetProfile"]["createType"]);
        if (created) setProfileId(created.id);
      }
      setIncome(nextIncome);
      setSavingsGoal(nextSavingsGoal);
      setCurrentSavings(nextCurrentSavings);
    },
    [profileId]
  );

  const addCategory = useCallback(
    async (input: { name: string; budgetAmount: number; description?: string }): Promise<void> => {
      await client.models.BudgetCategory.create(
        input as unknown as Schema["BudgetCategory"]["createType"]
      );
      await fetchAll();
    },
    [fetchAll]
  );

  const updateCategory = useCallback(
    async (
      id: string,
      input: { name: string; budgetAmount: number; description?: string }
    ): Promise<void> => {
      await client.models.BudgetCategory.update({
        id,
        ...input,
      } as unknown as Schema["BudgetCategory"]["updateType"]);
      await fetchAll();
    },
    [fetchAll]
  );

  const deleteCategory = useCallback(
    async (id: string): Promise<void> => {
      // No cascade delete on the backend - clear this category's expenses first.
      const relatedExpenses = expenses.filter((expense) => expense.categoryId === id);
      await Promise.all(
        relatedExpenses.map((expense) => client.models.Expense.delete({ id: expense.id }))
      );
      await client.models.BudgetCategory.delete({ id });
      await fetchAll();
    },
    [expenses, fetchAll]
  );

  const addExpense = useCallback(
    async (input: {
      categoryId: string;
      amount: number;
      note?: string;
      date: string;
    }): Promise<void> => {
      await client.models.Expense.create(input as unknown as Schema["Expense"]["createType"]);
      await fetchAll();
    },
    [fetchAll]
  );

  const deleteExpense = useCallback(
    async (id: string): Promise<void> => {
      await client.models.Expense.delete({ id });
      await fetchAll();
    },
    [fetchAll]
  );

  const totalAllocated = categories.reduce((sum, category) => sum + category.budgetAmount, 0);
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBalance = income - savingsGoal - totalSpent;
  const actualSavings = income - totalSpent;
  const savingsProgressPercent =
    savingsGoal > 0 ? Math.max(0, (actualSavings / savingsGoal) * 100) : 0;

  const categoriesWithSpending: CategoryWithSpending[] = categories.map((category) => {
    const spent = expenses
      .filter((expense) => expense.categoryId === category.id)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = category.budgetAmount - spent;
    const percentUsed = category.budgetAmount > 0 ? (spent / category.budgetAmount) * 100 : 0;
    return {
      ...category,
      spent,
      remaining,
      percentUsed,
      status: statusForPercent(percentUsed),
    };
  });

  return {
    income,
    savingsGoal,
    currentSavings,
    categories: categoriesWithSpending,
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
  };
};
