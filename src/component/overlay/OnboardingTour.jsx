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
        } else if (path.startsWith("/financing/user")) {
            tourKey = "financing";
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
        const pathToTourKey = (path) => {
            if (path === "/" || path === "/home") return "home";
            if (path.startsWith("/projects")) return "projects";
            if (path.startsWith("/contracts")) return "contracts";
            if (path.startsWith("/users")) return "users";
            if (path.startsWith("/audits")) return "audits";
            if (path.startsWith("/analytics")) return "analytics";
            if (path.startsWith("/financing/user")) return "financing";
            return "home";
        };

        const handleStartTour = (e) => {
            // Use tourKey from event, or derive from current path so the user gets the tour for the page they're on
            const tourKey = e.detail?.tourKey ?? pathToTourKey(location.pathname);
            // Small delay to allow the profile menu to close
            setTimeout(() => {
                startTour(tourKey);
            }, 300);
        };

        window.addEventListener("start-onboarding-tour", handleStartTour);
        return () => window.removeEventListener("start-onboarding-tour", handleStartTour);
    }, [startTour, location.pathname]);

    return null;
};

export default OnboardingTour;
