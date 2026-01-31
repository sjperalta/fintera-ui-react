import TotalWidgetCard from "./TotalWidgetCard";
import { formatLargeNumber } from "../../utils/formatters";
import { useLocale } from "../../contexts/LocaleContext";

function TotalWidget({ statistics }) {
  const { t, locale } = useLocale();

  // Map locale to locale string for number formatting
  const localeString = locale === 'es' ? 'es-HN' : 'en-US';



  // Helper function to format numbers
  const formatNumber = (number) => {
    return Number(number || 0).toLocaleString(localeString);
  };

  return (
    <div className="mb-[16px] sm:mb-[24px] lg:mb-[32px] w-full">
      <div className="grid grid-cols-1 gap-[16px] sm:gap-[20px] lg:gap-[24px] sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
        <div className="transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-lg">
          <TotalWidgetCard
            title={t('widgets.totalIncome')}
            amount={formatLargeNumber(statistics.total_income, localeString)}
            growth={Number(statistics.total_income_growth)} // You can calculate this based on previous period
            id="totalIncome"
            type="money"
            currency="L "
            cardType="income"
          />
        </div>

        {/* Replace interest card with on-time payments stat (no growth) */}
        <div className="transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-lg">
          <TotalWidgetCard
            title={t('widgets.onTimePayments')}
            amount={formatLargeNumber(statistics.on_time_payment, localeString)}
            id="onTimePayments"
            type="money"
            currency="L "
            cardType="onTimePayments"
          />
        </div>

        <div className="transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-lg">
          <TotalWidgetCard
            title={t('widgets.newCustomers')}
            amount={formatNumber(statistics.new_customers)}
            growth={Number(statistics.new_customers_growth)}
            id="newCustomers"
            type="number"
            cardType="customers"
          />
        </div>

        <div className="transform hover:scale-105 transition-all duration-300 ease-in-out hover:shadow-lg">
          <TotalWidgetCard
            title={t('widgets.newContracts')}
            amount={formatNumber(statistics.new_contracts)}
            growth={Number(statistics.new_contracts_growth)}
            id="newContracts"
            type="number"
            cardType="contracts"
          />
        </div>
      </div>

      {/* Additional summary cards for payment breakdown */}
      <div className="grid grid-cols-1 gap-[12px] sm:gap-[16px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 mt-4 sm:mt-6">
        <div className="bg-white dark:bg-darkblack-600 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-darkblack-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-bgray-500 dark:text-bgray-300 truncate">{t('widgets.reservations')}</p>
              <p className="text-lg sm:text-xl font-bold text-yellow-600 dark:text-yellow-400">L {formatNumber(statistics?.payment_reserve || 0)}</p>
            </div>
            <div className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-darkblack-600 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-darkblack-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-bgray-500 dark:text-bgray-300 truncate">{t('widgets.downPayment')}</p>
              <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">L {formatNumber(statistics?.payment_down_payment || 0)}</p>
            </div>
            <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-darkblack-600 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-darkblack-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-bgray-500 dark:text-bgray-300 truncate">{t('widgets.installments')}</p>
              <p className="text-lg sm:text-xl font-bold text-orange dark:text-orange">L {formatNumber(statistics?.payment_installments || 0)}</p>
            </div>
            <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 01-2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-darkblack-600 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-darkblack-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-bgray-500 dark:text-bgray-300 truncate">{t('widgets.capitalRepayment')}</p>
              <p className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300">L {formatNumber(statistics?.payment_capital_repayment || 0)}</p>
            </div>
            <div className="p-1.5 sm:p-2 bg-gray-100 dark:bg-darkblack-500/30 rounded-lg flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-darkblack-600 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-darkblack-500 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-bgray-500 dark:text-bgray-300 truncate">{t('widgets.lateInterest')}</p>
              <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">L {formatNumber(statistics?.total_interest || 0)}</p>
            </div>
            <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-lg flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TotalWidget;