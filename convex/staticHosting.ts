import { components } from "./_generated/api";
import {
  exposeDeploymentQuery,
  exposeUploadApi,
} from "@convex-dev/static-hosting";

// Internal functions for secure uploads through the static-hosting CLI.
export const {
  gcOldAssets,
  generateUploadUrl,
  generateUploadUrls,
  listAssets,
  recordAsset,
  recordAssets,
} = exposeUploadApi(components.staticHosting);

// Public query clients can subscribe to when checking for new deployments.
export const { getCurrentDeployment } = exposeDeploymentQuery(
  components.staticHosting,
);
