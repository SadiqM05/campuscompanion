import { useCallback, useEffect, useState } from "react";
import { client } from "../../lib/amplifyClient";
import type { Schema } from "../../../amplify/data/resource";

export interface PurchaseGoalRecord {
  id: string;
  name: string;
  targetAmount: number;
  description: string | null;
  deadline: string | null;
  allocatedFromCurrent: number;
  allocatedFromMonthly: number;
}

export type GoalStatus = "in-progress" | "complete";

export interface PurchaseGoalWithProgress extends PurchaseGoalRecord {
  totalAllocated: number;
  remaining: number;
  progressPercent: number;
  status: GoalStatus;
}

export interface GoalInput {
  name: string;
  targetAmount: number;
  description?: string;
  deadline?: string;
  allocatedFromCurrent: number;
  allocatedFromMonthly: number;
}

interface UsePurchaseGoalsResult {
  goals: PurchaseGoalWithProgress[];
  totalAllocatedFromCurrent: number;
  totalAllocatedFromMonthly: number;
  addGoal: (input: GoalInput) => Promise<void>;
  updateGoal: (id: string, input: GoalInput) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

// Deliberately independent of useBudget - it only knows about goals and their
// own allocation totals. Pages combine this with useBudget's currentSavings/
// savingsGoal to compute pool-level remaining amounts (e.g. on the Current
// Savings page), keeping the two hooks composable rather than coupled.
export const usePurchaseGoals = (): UsePurchaseGoalsResult => {
  const [goals, setGoals] = useState<PurchaseGoalRecord[]>([]);

  const fetchGoals = useCallback(async (): Promise<void> => {
    const { data: goalRecords } = await client.models.PurchaseGoal.list();
    setGoals(
      goalRecords.map((goal) => ({
        id: goal.id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        description: goal.description ?? null,
        deadline: goal.deadline ?? null,
        allocatedFromCurrent: goal.allocatedFromCurrent ?? 0,
        allocatedFromMonthly: goal.allocatedFromMonthly ?? 0,
      }))
    );
  }, []);

  useEffect(() => {
    // Standard fetch-on-mount; fetchGoals is also reused after every
    // mutation to refresh state, so it stays a standalone function rather
    // than an inline effect body (which is what this rule expects).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = useCallback(
    async (input: GoalInput): Promise<void> => {
      await client.models.PurchaseGoal.create(
        input as unknown as Schema["PurchaseGoal"]["createType"]
      );
      await fetchGoals();
    },
    [fetchGoals]
  );

  const updateGoal = useCallback(
    async (id: string, input: GoalInput): Promise<void> => {
      await client.models.PurchaseGoal.update({
        id,
        ...input,
      } as unknown as Schema["PurchaseGoal"]["updateType"]);
      await fetchGoals();
    },
    [fetchGoals]
  );

  const deleteGoal = useCallback(
    async (id: string): Promise<void> => {
      await client.models.PurchaseGoal.delete({ id });
      await fetchGoals();
    },
    [fetchGoals]
  );

  const goalsWithProgress: PurchaseGoalWithProgress[] = goals.map((goal) => {
    const totalAllocated = goal.allocatedFromCurrent + goal.allocatedFromMonthly;
    const remaining = goal.targetAmount - totalAllocated;
    const progressPercent = goal.targetAmount > 0 ? (totalAllocated / goal.targetAmount) * 100 : 0;
    return {
      ...goal,
      totalAllocated,
      remaining,
      progressPercent,
      status: progressPercent >= 100 ? "complete" : "in-progress",
    };
  });

  const totalAllocatedFromCurrent = goals.reduce((sum, goal) => sum + goal.allocatedFromCurrent, 0);
  const totalAllocatedFromMonthly = goals.reduce((sum, goal) => sum + goal.allocatedFromMonthly, 0);

  return {
    goals: goalsWithProgress,
    totalAllocatedFromCurrent,
    totalAllocatedFromMonthly,
    addGoal,
    updateGoal,
    deleteGoal,
  };
};
