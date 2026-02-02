import BarChart from "../chart/BarChart";

import { useContext, useRef, useState, useEffect } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import { formatLargeNumber } from "../../utils/formatters";
import { useLocale } from "../../contexts/LocaleContext";

function RevenueFlow({ selectedYear = new Date().getFullYear(), currentMonth }) {
  const ctx = useContext(ThemeContext);
  const warnedRef = useRef(false);
  const token = getToken();
  const { t, locale } = useLocale();

  if (ctx == null && !warnedRef.current) {
    // Warn once if ThemeContext is unexpectedly missing

    console.warn(t('errors.themeContextMissing'));
    warnedRef.current = true;
  }
  const theme = ctx?.theme ?? "";

  // Map locale to locale string for number formatting
  const localeString = locale === 'es' ? 'es-HN' : 'en-US';

  // State for API data
  const [revenueFlowData, setRevenueFlowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch revenue flow data
  useEffect(() => {
    const fetchRevenueFlow = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/v1/statistics/revenue_flow?year=${selectedYear}&current_month=${currentMonth}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`${t('errors.fetchRevenueFlowData')}: ${response.status}`);
        }

        const data = await response.json();
        setRevenueFlowData(data);
      } catch (err) {
        console.error('Error fetching revenue flow:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueFlow();
  }, [token, selectedYear, currentMonth, t]);

  // Fallback static data (in case API fails)
  let month = [
    t('common.months.jan'),
    t('common.months.feb'),
    t('common.months.mar'),
    t('common.months.apr'),
    t('common.months.may'),
    t('common.months.jun'),
    t('common.months.jul'),
    t('common.months.aug'),
    t('common.months.sep'),
    t('common.months.oct'),
    t('common.months.nov'),
    t('common.months.dec'),
  ];

  let dataSetsLight = [
    {
      label: "My First Dataset",
      data: [1, 5, 2, 2, 6, 7, 8, 7, 3, 4, 1, 3],
      backgroundColor: [
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(250, 204, 21, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
      ],
      borderWidth: 0,
      borderRadius: 5,
    },
    {
      label: "My First Dataset 2",
      data: [5, 2, 4, 2, 5, 8, 3, 7, 3, 4, 1, 3],
      backgroundColor: [
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(255, 120, 75, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
      ],
      borderWidth: 0,
      borderRadius: 5,
    },
    {
      label: "My First Dataset 3",
      data: [2, 5, 3, 2, 5, 6, 9, 7, 3, 4, 1, 3],
      backgroundColor: [
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(74, 222, 128, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
        "rgba(237, 242, 247, 1)",
      ],
      borderWidth: 0,
      borderRadius: 5,
    },
  ];
  let dataSetsDark = [
    {
      label: "My First Dataset",
      data: [1, 5, 2, 2, 6, 7, 8, 7, 3, 4, 1, 3],
      backgroundColor: [
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(250, 204, 21, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
      ],
      borderWidth: 0,
      borderRadius: 5,
    },
    {
      label: "My First Dataset 2",
      data: [5, 2, 4, 2, 5, 8, 3, 7, 3, 4, 1, 3],
      backgroundColor: [
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(255, 120, 75, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
      ],
      borderWidth: 0,
      borderRadius: 5,
    },
    {
      label: "My First Dataset 3",
      data: [2, 5, 3, 2, 5, 6, 9, 7, 3, 4, 1, 3],
      backgroundColor: [
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(74, 222, 128, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
        "rgba(42, 49, 60, 1)",
      ],
      borderWidth: 0,
      borderRadius: 5,
    },
  ];

  const options = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === "" ? "rgba(243 ,246, 255 ,1)" : "rgba(34,38,46,1)",
          borderDash: [5, 5],
          borderDashOffset: 2,
        },
        gridLines: {
          zeroLineColor: "rgb(243 ,246, 255 ,1)",
        },
        ticks: {
          color: theme === "" ? "black" : "white",
          callback(value) {
            // Format as currency with short format (2M, 1K, etc.)
            return `L ${formatLargeNumber(value, localeString)}`;
          },
        },
      },
      x: {
        ticks: {
          color: theme === "" ? "black" : "white",
        },
        grid: {
          color: theme === "" ? "rgba(243 ,246, 255 ,1)" : "rgba(34,38,46,1)",
          borderDash: [5, 5],
          borderDashOffset: 2,
        },
        gridLines: {
          zeroLineColor: "rgb(243 ,246, 255 ,1)",
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: L ${value.toLocaleString(localeString)}`;
          },
        },
      },
    },
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  };

  // Use API data if available, otherwise fallback to static data
  const chartLabels = revenueFlowData?.labels || month;
  const chartDatasets = revenueFlowData
    ? (theme === "" ? revenueFlowData.datasets_light : revenueFlowData.datasets_dark)
    : (theme === "" ? dataSetsLight : dataSetsDark);

  const data = {
    labels: chartLabels,
    datasets: chartDatasets,
  };

  return (
    <div className="flex w-full flex-col justify-between rounded-lg bg-white py-3 dark:bg-darkblack-600">
      <div className="mb-2 flex items-center justify-between border-b border-bgray-300 pb-2 dark:border-darkblack-400">
        <div className="flex items-center space-x-3">
          <h3 className="text-xl font-bold text-bgray-900 dark:text-white sm:text-2xl">
            {t('dashboard.annualRevenueProjection')}
          </h3>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            {selectedYear}
          </span>
        </div>

      </div>

      <div className="w-full h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-sm text-bgray-600 dark:text-bgray-50">{t('dashboard.loadingRevenueData')}</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-500">
              <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{t('common.error')}: {error}</p>
            </div>
          </div>
        ) : (
          <BarChart options={options} data={data} />
        )}
      </div>
    </div>
  );
}

export default RevenueFlow;
