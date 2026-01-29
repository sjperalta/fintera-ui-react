import React, { useState, useMemo, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../../config";
import AuthContext from "../../context/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { useLocale } from "../../contexts/LocaleContext";
import GenericFilter from "../../component/forms/GenericFilter";
import Report from "../../component/report";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Analytics = () => {
    const { t } = useLocale();
    const { token } = useContext(AuthContext);
    const { showToast } = useToast();

    // Calculate first and last day of the current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Filter state
    const [filterValue, setFilterValue] = useState("All");
    const [startDate, setStartDate] = useState(firstDay);
    const [endDate, setEndDate] = useState(lastDay);
    const [isFiltering, setIsFiltering] = useState(false);
    const [revenueTimeframe, setRevenueTimeframe] = useState("12M");
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());

    // Real data state
    const [projects, setProjects] = useState([]);
    const [overviewData, setOverviewData] = useState(null);
    const [distribution, setDistribution] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);

    // Fetch projects for filter
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(`${API_URL}/api/v1/projects?per_page=100`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setProjects(data.projects || []);
                }
            } catch (err) {
                console.error("Error fetching projects for filter:", err);
            }
        };

        if (token) fetchProjects();
    }, [token]);

    // Format project options for GenericFilter
    const projectOptions = useMemo(() => {
        const baseOptions = [{ label: t("common.all"), value: "All" }];
        const projectList = projects.map(p => ({
            label: p.name,
            value: p.id.toString()
        }));
        return [...baseOptions, ...projectList];
    }, [projects, t]);

    // Fetch all analytics data
    const fetchAnalyticsData = async () => {
        if (!token) return;

        setIsFiltering(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();
            if (filterValue !== "All") queryParams.append("project_id", filterValue);
            if (startDate) queryParams.append("start_date", startDate);
            if (endDate) queryParams.append("end_date", endDate);
            if (revenueTimeframe) queryParams.append("timeframe", revenueTimeframe);
            if (selectedYear) queryParams.append("year", selectedYear);

            // Fetch concurrently
            const [overviewRes, distributionRes, performanceRes] = await Promise.all([
                fetch(`${API_URL}/api/v1/analytics/overview?${queryParams.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/v1/analytics/distribution?${queryParams.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/api/v1/analytics/performance?${queryParams.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (!overviewRes.ok || !distributionRes.ok || !performanceRes.ok) {
                throw new Error("Failed to fetch some analytics data");
            }

            const [ovData, distData, perfData] = await Promise.all([
                overviewRes.json(),
                distributionRes.json(),
                performanceRes.json()
            ]);

            setOverviewData(ovData);
            setDistribution(distData);
            setPerformance(perfData);
        } catch (err) {
            console.error("Analytics fetch error:", err);
            setError(err.message);
            showToast(t("analytics.errorFetchingData"), "error");
        } finally {
            setIsFiltering(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalyticsData();
    }, [token, filterValue, startDate, endDate, revenueTimeframe, selectedYear]);

    const handleFilterChange = (val) => {
        setFilterValue(val);
    };

    const formatCurrency = (val) => {
        if (val === undefined || val === null) return `${overviewData?.currency_symbol || "L"}0`;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD', // Keep USD for formatting logic but replace symbol
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val).replace("$", overviewData?.currency_symbol || "L");
    };

    const formatPercent = (val) => {
        if (val === undefined || val === null) return "0%";
        return `${Number(val).toFixed(1)}%`;
    };

    const handleExport = async (format) => {
        try {
            const queryParams = new URLSearchParams();
            if (filterValue !== "All") queryParams.append("project_id", filterValue);
            if (startDate) queryParams.append("start_date", startDate);
            if (endDate) queryParams.append("end_date", endDate);
            queryParams.append("format", format);

            const response = await fetch(`${API_URL}/api/v1/analytics/export?${queryParams.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Export failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            showToast(t("common.downloadSuccess"), "success");
        } catch (err) {
            console.error("Export error:", err);
            showToast(t("common.downloadError"), "error");
        }
    };

    // Prepare chart data based on API response
    const revenueData = useMemo(() => {
        if (!overviewData?.revenue_trend || overviewData.revenue_trend.length === 0) {
            return { labels: [], datasets: [] };
        }

        const labels = overviewData.revenue_trend.map(point => point.label);
        const realData = overviewData.revenue_trend.map(point => point.real);
        const projectedData = overviewData.revenue_trend.map(point => point.projected);

        return {
            labels: labels,
            datasets: [
                {
                    label: t("analytics.realData"),
                    data: realData,
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: t("analytics.projections"),
                    data: projectedData,
                    borderColor: "rgb(147, 51, 234)",
                    borderDash: [5, 5],
                    backgroundColor: "transparent",
                    fill: false,
                    tension: 0.4,
                },
            ],
        };
    }, [overviewData, t]);

    const distributionData = useMemo(() => {
        if (!distribution) return { labels: [], datasets: [] };

        return {
            labels: [t("analytics.financed"), t("analytics.reserved"), t("analytics.available"), t("analytics.fully_paid")],
            datasets: [
                {
                    data: [
                        distribution.financed || 0,
                        distribution.reserved || 0,
                        distribution.available || 0,
                        distribution.fully_paid || 0
                    ],
                    backgroundColor: [
                        "rgba(99, 102, 241, 0.8)",  // Financed (Indigo)
                        "rgba(251, 146, 60, 0.8)", // Reserved
                        "rgba(34, 197, 94, 0.2)",  // Available (Faded Green)
                        "rgba(59, 130, 246, 0.8)", // Fully Paid (Blue)
                    ],
                    borderColor: [
                        "rgb(99, 102, 241)",
                        "rgb(251, 146, 60)",
                        "rgba(34, 197, 94, 0.4)",
                        "rgb(59, 130, 246)",
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [distribution, t]);

    const monthlyPerformanceData = useMemo(() => {
        if (!performance || performance.length === 0) return { labels: [], datasets: [] };

        // Ensure we are using real project data if performance is an array of projects
        const labels = Array.isArray(performance) ? performance.map(p => p.project_name) : (performance.weekly_labels || ["W1", "W2", "W3", "W4"]);
        const data = Array.isArray(performance) ? performance.map(p => p.growth_percentage) : (performance.weekly_performance || []);

        return {
            labels: labels,
            datasets: [
                {
                    label: t("analytics.growthAnalysis"),
                    data: data,
                    backgroundColor: "rgba(59, 130, 246, 0.6)",
                    borderRadius: 8,
                },
            ],
        };
    }, [performance, t]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    color: "currentColor", // Wraps to text color (switches in dark mode)
                    font: {
                        family: "'Urbanist', sans-serif",
                        size: 12
                    }
                },
            },
            tooltip: {
                backgroundColor: "rgba(17, 24, 39, 0.95)", // Darker, more opaque
                padding: 12,
                cornerRadius: 12,
                titleColor: "#fff",
                bodyColor: "#cbd5e1", // Slate-300
                borderColor: "rgba(255,255,255,0.1)",
                borderWidth: 1,
                displayColors: true,
                boxPadding: 4
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: "currentColor",
                    opacity: 0.7,
                    font: {
                        family: "'Urbanist', sans-serif",
                    }
                },
                border: {
                    display: false
                }
            },
            y: {
                grid: {
                    color: "rgba(156, 163, 175, 0.1)", // Subtle grid
                    drawBorder: false,
                },
                ticks: {
                    color: "currentColor",
                    opacity: 0.7,
                    padding: 10,
                    font: {
                        family: "'Urbanist', sans-serif",
                    }
                },
                border: {
                    display: false
                }
            },
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12,
            },
        },
    };

    return (
        <main className="w-full px-3 sm:px-6 pb-6 pt-[80px] xs:pt-[90px] sm:pt-[100px] md:pt-[120px] lg:pt-[156px] xl:px-12 xl:pb-12 2xl:px-16">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-8"
            >
                {/* Header and Filters */}
                <section className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <motion.div variants={itemVariants}>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                                {t("analytics.title")}
                            </h1>
                            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                                {t("analytics.subtitle")}
                            </p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex space-x-3">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleExport("csv")}
                                    className="px-5 py-2.5 bg-white dark:bg-darkblack-600 border border-gray-200 dark:border-darkblack-500 rounded-2xl shadow-sm text-sm font-bold hover:bg-gray-50 dark:hover:bg-darkblack-500 transition-all flex items-center gap-2 text-gray-700 dark:text-gray-200"
                                >
                                    CSV
                                </button>
                                <button
                                    onClick={() => handleExport("xlsx")}
                                    className="px-5 py-2.5 bg-blue-600 text-white border border-blue-600 rounded-2xl shadow-sm text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                                >
                                    Excel
                                </button>
                                <button
                                    onClick={() => setShowReportModal(true)}
                                    className="px-5 py-2.5 bg-white dark:bg-darkblack-600 border border-gray-200 dark:border-darkblack-500 rounded-2xl shadow-sm text-sm font-bold hover:bg-gray-50 dark:hover:bg-darkblack-500 transition-all flex items-center gap-2 text-gray-900 dark:text-white"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14.1667 11.6667H5.83333M14.1667 8.33333H5.83333M10 15H5.83333M16.6667 2.5V17.5C16.6667 17.9602 16.2936 18.3333 15.8333 18.3333H4.16667C3.70643 18.3333 3.33333 17.9602 3.33333 17.5V2.5C3.33333 2.03976 3.70643 1.66667 4.16667 1.66667H15.8333C16.2936 1.66667 16.6667 2.03976 16.6667 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {t("dashboard.reports")}
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div variants={itemVariants} className="w-full">
                        <GenericFilter
                            showSearch={false}
                            filterValue={filterValue}
                            onFilterChange={handleFilterChange}
                            filterOptions={projectOptions}
                            startDate={startDate}
                            onStartDateChange={setStartDate}
                            endDate={endDate}
                            onEndDateChange={setEndDate}
                            filterPlaceholder={t("projects.projectType")}
                        />
                    </motion.div>
                </section>

                {/* Chart Content Area with Loading State */}
                <div className="relative">
                    <AnimatePresence>
                        {isFiltering && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 bg-white/40 dark:bg-darkblack-900/40 backdrop-blur-sm rounded-3xl flex items-center justify-center"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm font-bold text-blue-600">{t("common.loading")}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={`space-y-8 transition-all duration-300 ${isFiltering ? "blur-[2px] opacity-60 scale-[0.99]" : ""}`}>
                        {/* Stats Grid */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: t("analytics.totalRevenue"), value: formatCurrency(overviewData?.total_revenue), change: overviewData?.revenue_change_percentage ? `${overviewData.revenue_change_percentage > 0 ? "+" : ""}${overviewData.revenue_change_percentage}%` : "0%", color: "text-blue-600 dark:text-blue-400" },
                                { label: t("analytics.activeContracts"), value: overviewData?.active_contracts || "0", change: overviewData?.contracts_change_percentage ? `${overviewData.contracts_change_percentage > 0 ? "+" : ""}${overviewData.contracts_change_percentage}%` : "0%", color: "text-purple-600 dark:text-purple-400" },
                                { label: t("analytics.averagePayment"), value: formatCurrency(overviewData?.average_payment), change: overviewData?.payment_change_percentage ? `${overviewData.payment_change_percentage > 0 ? "+" : ""}${overviewData.payment_change_percentage}%` : "0%", color: "text-orange-600 dark:text-orange-400" },
                                { label: t("analytics.occupancyRate"), value: formatPercent(overviewData?.occupancy_rate), change: overviewData?.occupancy_change_percentage ? `${overviewData.occupancy_change_percentage > 0 ? "+" : ""}${overviewData.occupancy_change_percentage}%` : "0%", color: "text-green-600 dark:text-green-400" },
                            ].map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                    className="bg-white dark:bg-darkblack-600 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-darkblack-500"
                                >
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                                    <div className="mt-2 flex items-baseline justify-between">
                                        <h2 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h2>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.change.startsWith("+")
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            }`}>
                                            {stat.change}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-400">{t("analytics.comparedToLastMonth")}</p>
                                </motion.div>
                            ))}
                        </section>

                        {/* Charts Row 1 */}
                        <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            {/* Main Trend Chart */}
                            <motion.div
                                variants={itemVariants}
                                className="xl:col-span-2 bg-white/80 dark:bg-darkblack-600/80 backdrop-blur p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-darkblack-500 overflow-hidden text-gray-900 dark:text-white"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold flex items-center space-x-2 text-gray-900 dark:text-white">
                                        <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                                        <span>{t("analytics.revenueTrend")}</span>
                                    </h3>
                                    <div className="flex items-center gap-4 bg-slate-900/5 dark:bg-slate-900/40 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-black/5 dark:border-white/5">
                                        <button
                                            onClick={() => setSelectedYear(y => y - 1)}
                                            className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-lg transition-all"
                                            title={t("analytics.previousYear")}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>

                                        <AnimatePresence mode="wait">
                                            <motion.span
                                                key={selectedYear}
                                                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-sm font-bold text-gray-900 dark:text-white min-w-[3.5rem] text-center"
                                            >
                                                {selectedYear}
                                            </motion.span>
                                        </AnimatePresence>

                                        <button
                                            onClick={() => setSelectedYear(y => y + 1)}
                                            className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 p-1 rounded-lg transition-all"
                                            title={t("analytics.nextYear")}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="h-[400px]">
                                    <Line data={revenueData} options={chartOptions} />
                                </div>
                            </motion.div>

                            {/* Distribution Chart (Lots Availability) */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white dark:bg-darkblack-600 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-darkblack-500 text-gray-900 dark:text-white"
                            >
                                <h3 className="text-xl font-bold mb-8 flex items-center space-x-2 text-gray-900 dark:text-white">
                                    <span className="w-2 h-6 bg-purple-600 rounded-full"></span>
                                    <span>{t("analytics.lotsAvailability")}</span>
                                </h3>
                                <div className="h-[300px] relative">
                                    <Doughnut data={distributionData} options={{
                                        ...chartOptions,
                                        cutout: "75%",
                                        plugins: {
                                            ...chartOptions.plugins,
                                            legend: { position: "bottom" }
                                        }
                                    }} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {distribution?.total_lots || 0}
                                        </span>
                                        <span className="text-sm text-gray-400">{t("projects.lots")}</span>
                                    </div>
                                </div>
                                <div className="mt-8 space-y-3">
                                    {[
                                        { label: t("analytics.financed") || "Financed", value: `${distribution?.financed_percentage || 0}%`, color: "bg-indigo-500" },
                                        { label: t("analytics.reserved"), value: `${distribution?.reserved_percentage || 0}%`, color: "bg-orange-500" },
                                        { label: t("analytics.available"), value: `${distribution?.available_percentage || 0}%`, color: "bg-green-500/40" },
                                        { label: t("analytics.fully_paid") || "Fully Paid", value: `${distribution?.fully_paid_percentage || 0}%`, color: "bg-blue-500" },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center space-x-2">
                                                <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                                                <span className="text-gray-600 dark:text-gray-300 font-medium">{item.label}</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </section>

                        {/* Charts Row 2 */}
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Monthly Performance */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white dark:bg-darkblack-600 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-darkblack-500 text-gray-900 dark:text-white"
                            >
                                <h3 className="text-xl font-bold mb-8 flex items-center space-x-2 text-gray-900 dark:text-white">
                                    <span className="w-2 h-6 bg-orange-600 rounded-full"></span>
                                    <span>{t("analytics.monthlyPerformance")}</span>
                                </h3>
                                <div className="h-[300px]">
                                    <Bar data={monthlyPerformanceData} options={chartOptions} />
                                </div>
                            </motion.div>

                            {/* Growth Analysis */}
                            <motion.div
                                variants={itemVariants}
                                className="bg-white dark:bg-darkblack-600 p-6 rounded-3xl shadow-2xl border border-gray-100 dark:border-darkblack-500 overflow-hidden relative text-gray-900 dark:text-white"
                            >
                                <h3 className="text-xl font-bold mb-8 flex items-center space-x-2 text-gray-900 dark:text-white">
                                    <span className="w-2 h-6 bg-green-600 rounded-full"></span>
                                    <span>{t("analytics.growthAnalysis")}</span>
                                </h3>
                                <div className="space-y-6">
                                    {(Array.isArray(performance) ? performance : []).map((project, idx) => {
                                        const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-indigo-500", "bg-rose-500"];
                                        const color = colors[idx % colors.length];
                                        return (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="font-medium text-gray-700 dark:text-gray-200">{project.project_name}</span>
                                                    <span className="text-gray-400 font-bold">{project.growth_percentage.toFixed(1)}%</span>
                                                </div>
                                                <div className="h-2 bg-gray-100 dark:bg-darkblack-500 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${project.growth_percentage}%` }}
                                                        transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
                                                        className={`h-full ${color}`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Decorative background element */}
                                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
                            </motion.div>
                        </section>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {showReportModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReportModal(false)}
                            className="fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-lg"
                        >
                            <div className="bg-white dark:bg-darkblack-600 rounded-2xl shadow-2xl p-6 border border-gray-100 dark:border-darkblack-500 mx-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("reports.financialReports")}</h3>
                                    <button
                                        onClick={() => setShowReportModal(false)}
                                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <Report startDate={startDate} endDate={endDate} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </main>
    );
};

export default Analytics;
