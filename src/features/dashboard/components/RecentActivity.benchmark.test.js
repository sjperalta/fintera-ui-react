import { describe, test } from 'vitest';
// We copy the logic here to avoid importing the component file which has dependencies that might fail in this isolated test environment without full app context.
// The goal is to benchmark the logic change.

// Mock translation function
const t = (key) => key;

// Original implementation logic
const originalFormatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return t("common.justNow") || "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

// Optimized implementation logic (as implemented in RecentActivity.jsx)
const formatTimeAgo = (dateString, now, t) => {
    const date = new Date(dateString);
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return t("common.justNow") || "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

describe('Date Formatting Benchmark', () => {
    const iterations = 1000000;
    const dates = Array.from({ length: iterations }, (_, i) => {
        const d = new Date();
        d.setMinutes(d.getMinutes() - (i % 10000)); // Distribute dates
        return d.toISOString();
    });

    test('Original Implementation (new Date() in loop)', () => {
        const start = performance.now();
        dates.forEach(date => originalFormatDate(date));
        const end = performance.now();
        console.log(`Original Implementation: ${(end - start).toFixed(4)}ms`);
    });

    test('Optimized Implementation (Shared now)', () => {
        const start = performance.now();
        const now = new Date();
        dates.forEach(date => formatTimeAgo(date, now, t));
        const end = performance.now();
        console.log(`Optimized Implementation: ${(end - start).toFixed(4)}ms`);
    });
});
