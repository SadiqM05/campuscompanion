import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
const schema = a.schema({
Note: a
    .model({
      name: a.string().required(),
      description: a.string().required(),
      image: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  UserPreference: a
    .model({
      theme: a.enum(['LIGHT', 'DARK', 'SYSTEM']),
    })
    .authorization((allow) => [allow.owner()]),

  BudgetProfile: a
    .model({
      expectedMonthlyIncome: a.float(),
      savingsGoal: a.float(),
      currentSavings: a.float(),
    })
    .authorization((allow) => [allow.owner()]),

  BudgetCategory: a
    .model({
      name: a.string().required(),
      budgetAmount: a.float().required(),
      description: a.string(),
      expenses: a.hasMany('Expense', 'categoryId'),
    })
    .authorization((allow) => [allow.owner()]),

  Expense: a
    .model({
      amount: a.float().required(),
      note: a.string(),
      date: a.date().required(),
      categoryId: a.id().required(),
      category: a.belongsTo('BudgetCategory', 'categoryId'),
    })
    .authorization((allow) => [allow.owner()]),

  PurchaseGoal: a
    .model({
      name: a.string().required(),
      targetAmount: a.float().required(),
      description: a.string(),
      deadline: a.date(),
      allocatedFromCurrent: a.float(),
      allocatedFromMonthly: a.float(),
    })
    .authorization((allow) => [allow.owner()]),
});
export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
