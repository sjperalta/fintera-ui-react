import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import { useLocale } from "../../contexts/LocaleContext";
import { useToast } from "../../contexts/ToastContext";

function Report({ startDate, endDate }) {
  const { showToast } = useToast();
  const { t } = useLocale();
  const [selectedReport, setSelectedReport] = useState("commissions_csv");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const REPORT_TYPES = [
    {
      id: "commissions_csv",
      titleKey: "reports.commissionsCsv",
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 7V10C12 10.3293 12.1308 10.6452 12.3636 10.878C12.5964 11.1108 12.9122 11.2415 13.2415 11.2415H16.2415" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.7243 19.3335H5.41398C4.92023 19.3335 4.44671 19.1374 4.09758 18.7882C3.74845 18.4391 3.55234 17.9656 3.55234 17.4718V4.44078C3.55234 3.94703 3.74845 3.47351 4.09758 3.12437C4.44671 2.77524 4.92023 2.57913 5.41398 2.57913H11.9304L16.5856 7.23433V17.4718C16.5856 17.9656 16.3895 18.4391 16.0404 18.7882C15.6912 19.1374 15.2177 19.3335 14.7243 19.3335Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: "total_revenue_csv",
      titleKey: "reports.revenueFlowCsv",
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 7V10C12 10.3293 12.1308 10.6452 12.3636 10.878C12.5964 11.1108 12.9122 11.2415 13.2415 11.2415H16.2415" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.7243 19.3335H5.41398C4.92023 19.3335 4.44671 19.1374 4.09758 18.7882C3.74845 18.4391 3.55234 17.9656 3.55234 17.4718V4.44078C3.55234 3.94703 3.74845 3.47351 4.09758 3.12437C4.44671 2.77524 4.92023 2.57913 5.41398 2.57913H11.9304L16.5856 7.23433V17.4718C16.5856 17.9656 16.3895 18.4391 16.0404 18.7882C15.6912 19.1374 15.2177 19.3335 14.7243 19.3335Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      id: "overdue_payments_csv",
      titleKey: "reports.overduePaymentsCsv",
      iconColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 7V10C12 10.3293 12.1308 10.6452 12.3636 10.878C12.5964 11.1108 12.9122 11.2415 13.2415 11.2415H16.2415" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.7243 19.3335H5.41398C4.92023 19.3335 4.44671 19.1374 4.09758 18.7882C3.74845 18.4391 3.55234 17.9656 3.55234 17.4718V4.44078C3.55234 3.94703 3.74845 3.47351 4.09758 3.12437C4.44671 2.77524 4.92023 2.57913 5.41398 2.57913H11.9304L16.5856 7.23433V17.4718C16.5856 17.9656 16.3895 18.4391 16.0404 18.7882C15.6912 19.1374 15.2177 19.3335 14.7243 19.3335Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ];

  const currentReport = REPORT_TYPES.find(r => r.id === selectedReport);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const downloadCSV = async () => {
    if (!selectedReport) return;

    // Validate that both dates are selected
    if (!startDate || !endDate) {
      showToast(t('reports.selectBothDates'), "error");
      return;
    }

    // Validate that start date is not after end date
    if (new Date(startDate) > new Date(endDate)) {
      showToast(t('reports.startDateAfterEndDate'), "error");
      return;
    }

    try {
      const token = getToken();
      const queryParams = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });

      const reportEndpoint = selectedReport;
      const url = `${API_URL}/api/v1/reports/${reportEndpoint}?${queryParams.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(t('reports.fetchCsvFailed'));
      }

      const blob = await res.blob();
      const filename = `${reportEndpoint}.csv`;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      showToast(t("common.downloadSuccess"), "success");
    } catch (err) {
      console.error("Error downloading CSV:", err);
      showToast(t('reports.downloadError'), "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Availability Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-darkblack-500">
        <h4 className="font-semibold text-bgray-900 dark:text-white text-sm">
          {t('reports.availableReports')}
        </h4>
        {(!startDate || !endDate) ? (
          <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full animate-pulse">
            {t('reports.selectDates')}
          </span>
        ) : (
          <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
            {t("status.available")}
          </span>
        )}
      </div>

      {/* Custom Select Component (Beauty Listbox) */}
      <div className="relative" ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`
            w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-300
            ${isDropdownOpen
              ? "border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-darkblack-500"
              : "border-gray-200 dark:border-darkblack-400 bg-gray-50/50 dark:bg-darkblack-600 hover:border-blue-400"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${currentReport?.bgColor} ${currentReport?.iconColor}`}>
              {currentReport?.icon}
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-gray-900 dark:text-white">
                {t(currentReport?.titleKey)}
              </span>
              <span className="block text-xs text-gray-400">
                CSV Format
              </span>
            </div>
          </div>
          <motion.svg
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="absolute top-full left-0 right-0 mt-2 p-1.5 bg-white dark:bg-darkblack-600 rounded-2xl shadow-xl border border-gray-100 dark:border-darkblack-400 z-20"
            >
              {REPORT_TYPES.map((report) => (
                <motion.button
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report.id);
                    setIsDropdownOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 p-2.5 rounded-xl transition-all mb-1 last:mb-0
                    ${selectedReport === report.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-darkblack-500"
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg
                    ${selectedReport === report.id
                      ? report.bgColor + " " + report.iconColor
                      : "bg-gray-100 dark:bg-darkblack-500 text-gray-400"
                    }
                  `}>
                    {report.icon}
                  </div>
                  <div className="text-left flex-1">
                    <span className={`
                      block text-sm font-semibold
                      ${selectedReport === report.id
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                      }
                    `}>
                      {t(report.titleKey)}
                    </span>
                  </div>
                  {selectedReport === report.id && (
                    <div className="pr-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-2">
        <button
          onClick={downloadCSV}
          disabled={!startDate || !endDate || !selectedReport}
          className={`
            w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg relative overflow-hidden group
            ${(!startDate || !endDate || !selectedReport)
              ? "bg-gray-100 dark:bg-darkblack-500 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 hover:shadow-blue-500/50"
            }
          `}
        >
          {(!(!startDate || !endDate || !selectedReport)) && (
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl"></div>
          )}

          <svg className="relative z-10" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.1667 11.6667H5.83333M14.1667 8.33333H5.83333M10 15H5.83333M16.6667 2.5V17.5C16.6667 17.9602 16.2936 18.3333 15.8333 18.3333H4.16667C3.70643 18.3333 3.33333 17.9602 3.33333 17.5V2.5C3.33333 2.03976 3.70643 1.66667 4.16667 1.66667H15.8333C16.2936 1.66667 16.6667 2.03976 16.6667 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="relative z-10">
            {t("common.download")} {currentReport ? t(currentReport.titleKey) : ""}
          </span>
        </button>
      </div>
    </div>
  );
}

export default Report;