import { httpRouter } from "convex/server";
import { registerStaticRoutes } from "@convex-dev/static-hosting";
import { components } from "./_generated/api";

const http = httpRouter();

// Serve the built Vite app from Convex storage with SPA fallback.
registerStaticRoutes(http, components.staticHosting);

export default http;
