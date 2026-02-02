import PropTypes from 'prop-types';
import { useLocale } from '../../contexts/LocaleContext';

export default function ProjectLotCards({ currentContract }) {
  const { t } = useLocale();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
      {/* Project Card */}
      <div className="bg-white/80 dark:bg-darkblack-600/80 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-darkblack-300/20 shadow-sm hover:shadow-md transition-all duration-200 h-full">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('contracts.project')}</p>
            <p className="font-bold text-gray-900 dark:text-white leading-tight text-sm">
              {currentContract?.project_name || currentContract?.project?.name || t('contracts.noName')}
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {t('contracts.id')}: {currentContract?.project_id || "N/A"} · {currentContract?.project_address || currentContract?.project?.address || t('contracts.noAddress')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lot Card */}
      <div className="bg-white/80 dark:bg-darkblack-600/80 backdrop-blur-sm rounded-lg p-3 border border-white/20 dark:border-darkblack-300/20 shadow-sm hover:shadow-md transition-all duration-200 h-full">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('contracts.lot')}</p>
            <p className="font-bold text-gray-900 dark:text-white leading-tight text-sm">
              {currentContract?.lot_name || currentContract?.lot?.name || `#${currentContract?.lot_id}` || t('contracts.noName')}
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {t('contracts.id')}: {currentContract?.lot_id || "N/A"} · {currentContract?.lot_address || currentContract?.lot?.address || t('contracts.noAddress')}
                </p>
              </div>
              {currentContract?.lot_area && (
                <span className="text-xs font-medium px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                  {currentContract.lot_area} {t('projects.squareMeters')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ProjectLotCards.propTypes = {
  currentContract: PropTypes.object,
};
