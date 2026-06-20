/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiPromptImports from "../aiPromptImports.js";
import type * as aiPromptSettings from "../aiPromptSettings.js";
import type * as aiScripts from "../aiScripts.js";
import type * as apiKeyActions from "../apiKeyActions.js";
import type * as auth from "../auth.js";
import type * as buildItems from "../buildItems.js";
import type * as http from "../http.js";
import type * as legacyMigration from "../legacyMigration.js";
import type * as promptTemplates from "../promptTemplates.js";
import type * as scriptVoices from "../scriptVoices.js";
import type * as staticHosting from "../staticHosting.js";
import type * as teleprompter from "../teleprompter.js";
import type * as userApiKeys from "../userApiKeys.js";
import type * as users from "../users.js";
import type * as videoJobs from "../videoJobs.js";
import type * as voice from "../voice.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiPromptImports: typeof aiPromptImports;
  aiPromptSettings: typeof aiPromptSettings;
  aiScripts: typeof aiScripts;
  apiKeyActions: typeof apiKeyActions;
  auth: typeof auth;
  buildItems: typeof buildItems;
  http: typeof http;
  legacyMigration: typeof legacyMigration;
  promptTemplates: typeof promptTemplates;
  scriptVoices: typeof scriptVoices;
  staticHosting: typeof staticHosting;
  teleprompter: typeof teleprompter;
  userApiKeys: typeof userApiKeys;
  users: typeof users;
  videoJobs: typeof videoJobs;
  voice: typeof voice;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  staticHosting: import("@convex-dev/static-hosting/_generated/component.js").ComponentApi<"staticHosting">;
};
