import React from 'react';
import PropTypes from 'prop-types';
import { useLocale } from '../../contexts/LocaleContext';
import { motion } from 'framer-motion';

export default function CreditScoreCard({ creditScore }) {
  const { t } = useLocale();
  const score = creditScore || 0;
  const scorePercentage = Math.round(score);

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-emerald-500 dark:text-emerald-400";
    if (percentage >= 60) return "text-amber-500 dark:text-amber-400";
    return "text-rose-500 dark:text-rose-400";
  };

  const getScoreLabel = (percentage) => {
    if (percentage >= 80) return t('creditScore.excellent');
    if (percentage >= 60) return t('creditScore.good');
    return t('creditScore.needsImprovement');
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return "from-emerald-400 to-emerald-600";
    if (percentage >= 60) return "from-amber-400 to-amber-600";
    return "from-rose-400 to-rose-600";
  };

  return (
    <div className="bg-white/50 dark:bg-darkblack-600/40 backdrop-blur-sm rounded-xl p-4 border border-bgray-100 dark:border-darkblack-400 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg bg-gray-50 dark:bg-darkblack-500 flex items-center justify-center border border-bgray-100 dark:border-darkblack-400`}>
            <svg className={`w-4 h-4 ${getScoreColor(scorePercentage)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-[10px] font-black text-bgray-400 dark:text-bgray-500 uppercase tracking-widest leading-none mb-1">{t('creditScore.title')}</h4>
            <p className={`text-[11px] font-black uppercase tracking-tight leading-none ${getScoreColor(scorePercentage)}`}>
              {getScoreLabel(scorePercentage)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-lg font-black ${getScoreColor(scorePercentage)} tabular-nums leading-none`}>
            {scorePercentage}%
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="h-1.5 w-full bg-bgray-100 dark:bg-darkblack-500 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${scorePercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full bg-gradient-to-r ${getProgressBarColor(scorePercentage)} rounded-full shadow-sm relative`}
          />
        </div>
        <div className="flex justify-between items-center px-0.5">
          <span className="text-[9px] font-bold text-bgray-400 dark:text-bgray-500 uppercase tracking-widest opacity-80">
            {t('creditScore.description')}
          </span>
          <span className="text-[9px] font-bold text-bgray-400 dark:text-bgray-500 uppercase tracking-widest opacity-80">
            {t('creditScore.outOf100')}
          </span>
        </div>
      </div>
    </div>
  );
}

CreditScoreCard.propTypes = {
  creditScore: PropTypes.number,
};
