import { useEffect } from "react";
import Router from "./Router";
import { LocaleProvider } from "./contexts/LocaleContext";
import { ToastProvider } from "./contexts/ToastContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";

import ErrorBoundary from "./component/error/ErrorBoundary";

function App() {
  useEffect(() => {
    // Lazy-load AOS (and its CSS) to reduce initial bundle egress
    Promise.all([import("aos"), import("aos/dist/aos.css")]).then(([AOS]) => {
      AOS.default.init();
      AOS.default.refresh();
    });
  }, []);
  return (
    <>
      <LocaleProvider>
        <OnboardingProvider>
          <ToastProvider>
            <ErrorBoundary fallback={<div>Something went wrong.</div>}>

              <Router />
            </ErrorBoundary>
          </ToastProvider>
        </OnboardingProvider>
      </LocaleProvider>
    </>
  );
}

export default App;
