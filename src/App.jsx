import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import Router from "./Router";
import { LocaleProvider } from "./contexts/LocaleContext";
import { ToastProvider } from "./contexts/ToastContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";

import ErrorBoundary from "./component/error/ErrorBoundary";

function App() {
  useEffect(() => {
    AOS.init();
    AOS.refresh();
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
