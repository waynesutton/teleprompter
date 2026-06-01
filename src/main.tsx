import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { getConvexUrl } from "@convex-dev/static-hosting";
import App from "./App";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/lexend/400.css";
import "@fontsource/lexend/700.css";
import "@fontsource/opendyslexic/400.css";
import "@fontsource/opendyslexic/700.css";
import "./styles.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL || getConvexUrl();

if (!convexUrl) {
  throw new Error("Missing VITE_CONVEX_URL. Run `npx convex dev` to create a local Convex deployment.");
}

const convex = new ConvexReactClient(convexUrl);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexAuthProvider client={convex}>
      <App />
    </ConvexAuthProvider>
  </StrictMode>,
);
