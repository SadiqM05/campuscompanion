import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

// Shared Amplify data client used across features (Notes, Settings, ...).
export const client = generateClient<Schema>({
  authMode: "userPool",
});
