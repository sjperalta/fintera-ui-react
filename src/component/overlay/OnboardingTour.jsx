import { useEffect } from "react";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { useLocation } from "react-router-dom";

const OnboardingTour = () => {
    const { startTour, isTourCompleted } = useOnboarding();
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        let tourKey = null;

        if (path === "/" || path === "/home") {
            tourKey = "home";
        } else if (path.startsWith("/projects")) {
            tourKey = "projects";
        } else if (path.startsWith("/contracts")) {
            tourKey = "contracts";
        } else if (path.startsWith("/users")) {
            tourKey = "users";
        } else if (path.startsWith("/audits")) {
            tourKey = "audits";
        } else if (path.startsWith("/analytics")) {
            tourKey = "analytics";
        }

        if (tourKey && !isTourCompleted(tourKey)) {
            // Small delay to ensure all elements are rendered
            const timer = setTimeout(() => {
                startTour(tourKey);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isTourCompleted, location.pathname, startTour]);

    useEffect(() => {
        const handleStartTour = (e) => {
            const tourKey = e.detail?.tourKey || "home";
            // Small delay to allow the profile menu to close
            setTimeout(() => {
                startTour(tourKey);
            }, 300);
        };

        window.addEventListener("start-onboarding-tour", handleStartTour);
        return () => window.removeEventListener("start-onboarding-tour", handleStartTour);
    }, [startTour]);

    return null;
};

export default OnboardingTour;
