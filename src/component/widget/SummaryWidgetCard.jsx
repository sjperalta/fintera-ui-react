import ProtoTypes from "prop-types";
import LineChart from "../chart/LineChart";
import { useEffect } from "react";
import { useRef } from "react";
import { useLocale } from "../../contexts/LocaleContext";

const createGradient = (ctx) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 450);
  gradient.addColorStop(0, "rgba(34, 197, 94,0.41)");
  gradient.addColorStop(0.2, "rgba(255, 255, 255, 0)");
  return gradient;
};

function SummaryWidgetCard({ title, amount, fee, totalEarnImg, currency, type }) {
  const chartRef = useRef(null);
  const { t } = useLocale();

  useEffect(() => {
    // Get canvas context and create gradient
    const ctx = chartRef?.current?.getContext("2d")?.chart.ctx;
    if (ctx) {
      const gradient = createGradient(ctx);
      // Update chart data and options
      chartRef.current.data.datasets[0].backgroundColor = gradient;
      chartRef.current.update();
    }
  }, []);

  // Define card styles based on type
  const getCardStyles = () => {
    switch (type) {
      case 'financing':
        return {
          gradient: 'from-blue-500 to-blue-600',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          shadow: 'shadow-blue-100 dark:shadow-blue-900/20'
        };
      case 'due':
        return {
          gradient: 'from-orange-500 to-red-500',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
          shadow: 'shadow-red-100 dark:shadow-red-900/20'
        };
      default:
        return {
          gradient: 'from-success-400 to-success-500',
          iconBg: 'bg-success-100 dark:bg-success-900/30',
          iconColor: 'text-success-600 dark:text-success-400',
          shadow: 'shadow-success-100 dark:shadow-success-900/20'
        };
    }
  };

  const cardStyles = getCardStyles();

  const options = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        display: false,
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        position: "top",
      },
      title: {
        display: false,
        text: "Visitor: 2k",
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  const labels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const data = {
    labels,
    datasets: [
      {
        data: [0, 10, 0, 65, 0, 25, 0, 35, 20, 100, 40, 75, 50, 85, 60],
        label: "Balance",
        borderColor: "#22C55E",
        pointRadius: 0,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#22C55E",
        borderWidth: 2,
        fill: true,
        fillColor: "#fff",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className={`relative rounded-xl bg-white dark:bg-darkblack-600 p-6 shadow-lg ${cardStyles.shadow} border border-gray-100 dark:border-darkblack-500 overflow-hidden transition-all duration-300 hover:shadow-xl`}>
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cardStyles.gradient} opacity-5 rounded-full -mr-16 -mt-16`}></div>

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${cardStyles.iconBg} p-3 rounded-lg`}>
              {totalEarnImg ? (
                <img src={totalEarnImg} alt="icon" className="w-6 h-6" />
              ) : (
                <svg className={`w-6 h-6 ${cardStyles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              )}
            </div>
            <div>
              <span className="text-lg font-semibold text-bgray-900 dark:text-white block">
                {title}
              </span>
              <span className="text-sm text-bgray-500 dark:text-bgray-300">
                {t('dashboard.currentStatus')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex-1">
            <p className="text-3xl font-bold leading-tight text-bgray-900 dark:text-white mb-2">
              {currency}{amount}
            </p>
            {fee && (
              <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                <span className={`${cardStyles.iconColor}`}>
                  <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M13.4318 0.522827L12.4446 0.522827L8.55575 0.522827L7.56859 0.522827C6.28227 0.522827 5.48082 1.91818 6.12896 3.02928L9.06056 8.05489C9.7037 9.1574 11.2967 9.1574 11.9398 8.05489L14.8714 3.02928C15.5196 1.91818 14.7181 0.522828 13.4318 0.522827Z"
                      fill="currentColor"
                    />
                    <path
                      opacity="0.4"
                      d="M2.16878 13.0485L3.15594 13.0485L7.04483 13.0485L8.03199 13.0485C9.31831 13.0485 10.1198 11.6531 9.47163 10.542L6.54002 5.5164C5.89689 4.41389 4.30389 4.41389 3.66076 5.5164L0.729153 10.542C0.0810147 11.6531 0.882466 13.0485 2.16878 13.0485Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <div>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {currency}{fee}
                  </span>
                  <span className="text-xs text-red-500 dark:text-red-300 ml-1">
                    {t('payments.lateInterest')}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="w-[120px] h-[80px] ml-4">
            <LineChart option={options} dataSet={data} refer={chartRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

SummaryWidgetCard.propTypes = {
  title: ProtoTypes.string,
  amount: ProtoTypes.string,
  totalEarnImg: ProtoTypes.string,
};

export default SummaryWidgetCard;
