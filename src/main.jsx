import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.jsx";
import "./assets/css/style.css";
import "./assets/css/font-awesome-all.min.css";
import "./index.css";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "quill/dist/quill.snow.css";
import { AuthProvider } from './contexts/AuthContext.jsx';
import { registerSW } from "virtual:pwa-register";

if (import.meta.env.MODE === "production") {
  registerSW();
}

// Initialize Sentry only when a DSN is provided to avoid noisy errors in
// non-production or local environments.
const _sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (_sentryDsn) {
  Sentry.init({
    dsn: _sentryDsn,
    environment: import.meta.env.MODE ?? "development",
    // Set a release if available (useful for grouping and source maps)
    release:
      import.meta.env.VITE_APP_VERSION ?? undefined,
    // Keep traces disabled unless you intentionally enable performance monitoring
    tracesSampleRate: 0.3,
    integrations: [Sentry.browserTracingIntegration()],
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
