import React, { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import QuickActionCard from "../../component/dashboard/QuickActionCard";
import RecentActivity from "../../component/dashboard/RecentActivity";
import { motion } from "framer-motion";

function Home() {
  const { user } = useContext(AuthContext);
  const { t } = useLocale();

  // Greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return t("home.goodMorning") || "Good morning";
    if (hours < 18) return t("home.goodAfternoon") || "Good afternoon";
    return t("home.goodEvening") || "Good evening";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15
      }
    }
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700 min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8"
      >
      </motion.div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Quick Actions */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-bgray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t("dashboard.quickActions") || "Quick Actions"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  to: "/payments",
                  color: "green",
                  title: t("dashboard.newPayment") || "Register Payment",
                  desc: t("dashboard.newPaymentDesc") || "Record a new payment for a contract.",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                },
                {
                  to: "/projects",
                  color: "blue",
                  title: t("dashboard.newContract") || "New Contract",
                  desc: t("dashboard.newContractDesc") || "Start a new sale process in a project.",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                },
                {
                  to: "/users",
                  color: "purple",
                  title: t("dashboard.manageUsers") || "Manage Users",
                  desc: t("dashboard.manageUsersDesc") || "Add or update system users.",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                },
                {
                  to: "/analytics",
                  color: "indigo",
                  title: t("dashboard.viewAnalytics") || "View Analytics",
                  desc: t("dashboard.viewAnalyticsDesc") || "Deep dive into financial reports.",
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                }
              ].map((action, idx) => (
                <motion.div variants={itemVariants} key={idx} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <QuickActionCard
                    to={action.to}
                    color={action.color}
                    title={action.title}
                    description={action.desc}
                    icon={
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {action.icon}
                      </svg>
                    }
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Status Overview Banner (Optional, keeping it simple for now) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left text-white">
                <h3 className="text-2xl font-bold mb-2">
                  {t("dashboard.systemHealth") || "System Status"}
                </h3>
                <p className="text-blue-100 max-w-md">
                  {t("dashboard.systemHealthDesc") || "All systems are operational. Check the audits log for detailed activity tracking."}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/audits'}
                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                {t("dashboard.viewLogs") || "View System Logs"}
              </motion.button>
            </div>
            {/* Decorative Circles */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-10 blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1], x: [0, 10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-0 left-0 -ml-20 -mb-20 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl"
            />
          </div>
        </motion.div>

        {/* Right Column: Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-1 h-full min-h-[500px]">
          <RecentActivity />
        </motion.div>

      </div>
    </main>
  );
}

export default Home;