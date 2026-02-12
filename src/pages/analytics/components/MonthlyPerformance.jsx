import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import PropTypes from "prop-types";

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100, damping: 12 },
    },
};

const GROWTH_BAR_COLORS = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-indigo-500", "bg-rose-500"];

const MonthlyPerformance = memo(({ performance, chartOptions, t }) => {
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

    return (
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
                        const color = GROWTH_BAR_COLORS[idx % GROWTH_BAR_COLORS.length];
                        return (
                            <div key={project.project_name ?? idx} className="space-y-2">
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
    );
});

MonthlyPerformance.propTypes = {
    performance: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    chartOptions: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
};

export default MonthlyPerformance;
