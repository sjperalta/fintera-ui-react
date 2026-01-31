import PropTypes from "prop-types";
import LineChart from "../chart/LineChart";
import { useEffect } from "react";
import { useRef } from "react";

const createGradient = (ctx) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 450);
  gradient.addColorStop(0, "rgba(34, 197, 94,0.41)");
  gradient.addColorStop(0.2, "rgba(255, 255, 255, 0)");
  return gradient;
};

function TotalWidgetCard({ title, amount, growth, currency, type, cardType }) {
  const chartRef = useRef(null);

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

  // Define card styles based on cardType
  const getCardStyles = () => {
    switch (cardType) {
      case 'income':
        return {
          gradient: 'from-blue-500 to-blue-600',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          shadow: 'shadow-blue-100 dark:shadow-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800'
        };
      case 'ontimepayments':
        return {
          gradient: 'from-green-500 to-green-600',
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          iconColor: 'text-green-600 dark:text-green-400',
          shadow: 'shadow-green-100 dark:shadow-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800'
        };
      case 'customers':
        return {
          gradient: 'from-pink-500 to-pink-600',
          iconBg: 'bg-pink-100 dark:bg-pink-900/30',
          iconColor: 'text-pink-600 dark:text-pink-400',
          shadow: 'shadow-pink-100 dark:shadow-pink-900/20',
          borderColor: 'border-pink-200 dark:border-pink-800'
        };
      case 'contracts':
        return {
          gradient: 'from-indigo-500 to-indigo-600',
          iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
          iconColor: 'text-indigo-600 dark:text-indigo-400',
          shadow: 'shadow-indigo-100 dark:shadow-indigo-900/20',
          borderColor: 'border-indigo-200 dark:border-indigo-800'
        };
      case 'payments':
        return {
          gradient: 'from-orange-500 to-orange-600',
          iconBg: 'bg-orange-100 dark:bg-orange-900/30',
          iconColor: 'text-orange-600 dark:text-orange-400',
          shadow: 'shadow-orange-100 dark:shadow-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800'
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          iconBg: 'bg-gray-100 dark:bg-gray-900/30',
          iconColor: 'text-gray-600 dark:text-gray-400',
          shadow: 'shadow-gray-100 dark:shadow-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800'
        };
    }
  };

  const cardStyles = getCardStyles();

  // Get appropriate icon based on card type
  const getCardIcon = () => {
    switch (cardType) {
      case 'income':
        return (
          <svg className={`w-6 h-6 ${cardStyles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'interest':
        return (
          <svg className={`w-6 h-6 ${cardStyles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'customers':
        return (
          <svg className={`w-6 h-6 ${cardStyles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'contracts':
        return (
          <svg className={`w-6 h-6 ${cardStyles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'payments':
        return (
          <svg className={`w-6 h-6 ${cardStyles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'ontimepayments':
        return (
          <svg className={`w-6 h-6 ${cardStyles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return (
          <svg className={`w-6 h-6 ${cardStyles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

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
    "Jan",
    "Feb",
    "Mar",
    "Afril",
    "May",
    "Jan",
    "Feb",
    "Mar",
    "Afril",
    "May",
    "Feb",
    "Mar",
    "Afril",
    "May",
  ];

  const data = {
    labels,
    datasets: [
      {
        data: [0, 10, 0, 65, 0, 25, 0, 35, 20, 100, 40, 75, 50, 85, 60],
        label: "Visitor",
        borderColor: "#22C55E",
        pointRadius: 0,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#22C55E",
        borderWidth: 1,
        fill: true,
        fillColor: "#fff",
        tension: 0.4,
      },
    ],
  };
  return (
    <div className={`relative rounded-xl bg-white dark:bg-darkblack-600 p-6 shadow-lg ${cardStyles.shadow} border ${cardStyles.borderColor} overflow-hidden transition-all duration-300 hover:shadow-xl`}>
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cardStyles.gradient} opacity-5 rounded-full -mr-16 -mt-16`}></div>

      <div className="relative z-10">
        <div className="mb-6 flex items-center space-x-3">
          <div className={`${cardStyles.iconBg} p-3 rounded-lg`}>
            {getCardIcon()}
          </div>
          <div>
            <span className="text-lg font-semibold text-bgray-900 dark:text-white block">
              {title}
            </span>
            <span className="text-sm text-bgray-500 dark:text-bgray-300">
              Período actual
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex-1">
            <p className="text-3xl font-bold leading-tight text-bgray-900 dark:text-white mb-3">
              {type === "money" && currency}{amount}
            </p>
            {typeof growth === 'number' ? (
              <div className="flex items-center space-x-2">
                <span className={growth >= 0 ? "text-success-300" : "text-red-400"}>
                  <svg
                    width="16"
                    height="14"
                    viewBox="0 0 16 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={growth < 0 ? "rotate-180" : ""}
                  >
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
                <span className={`text-sm font-medium ${growth >= 0 ? "text-success-300" : "text-red-400"}`}>
                  {Math.abs(growth)}%
                </span>
                <span className="text-sm font-medium text-bgray-700 dark:text-bgray-50">
                  {growth >= 0 ? "Aumento" : "Disminución"}
                </span>
              </div>
            ) : (
              // Spacer to keep card height/alignment consistent when growth is absent
              <div aria-hidden="false">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-success-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                </div>
              </div>
            )}
          </div>
          <div className="w-[100px] h-[70px] lg:w-[80px] lg:h-[68px] ml-4">
            <LineChart option={options} dataSet={data} refer={chartRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

TotalWidgetCard.propTypes = {
  title: PropTypes.string,
  amount: PropTypes.string,
  growth: PropTypes.number,

};

export default TotalWidgetCard;
