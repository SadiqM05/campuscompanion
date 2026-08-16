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
});
export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
