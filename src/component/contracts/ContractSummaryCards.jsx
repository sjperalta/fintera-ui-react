import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faCalculator,
  faTag,
  faPiggyBank,
  faWallet,
  faHandHoldingUsd,
  faChartLine,
} from '@fortawesome/free-solid-svg-icons';
import { useLocale } from '../../contexts/LocaleContext';

const SummaryCard = ({ title, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 260, damping: 20 }}
    whileHover={{ y: -4 }}
    className="bg-white/80 dark:bg-darkblack-600/80 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 dark:border-darkblack-400/50 shadow-xl shadow-black/5 flex flex-col gap-4 group transition-all duration-300 hover:shadow-2xl hover:bg-white dark:hover:bg-darkblack-600"
  >
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white text-lg shadow-lg relative overflow-hidden`}>
      <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      <FontAwesomeIcon icon={icon} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1 leading-none">{title}</p>
      <p className="text-xl font-black text-gray-900 dark:text-white truncate tracking-tight">{value}</p>
    </div>
  </motion.div>
);

const ContractSummaryCards = ({ summary, currentContract, fmt }) => {
  const { t } = useLocale();

  if (!summary) return null;

  const financingType = currentContract?.financing_type?.toLowerCase();
  const isBankOrCash = financingType === 'bank' || financingType === 'cash';

  const cards = [
    { title: t("contracts.total"), value: fmt(summary.price), icon: faTag, color: "bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/20" },
    { title: t("contracts.reserve"), value: fmt(summary.reserve), icon: faPiggyBank, color: "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/20" },
    ...(!isBankOrCash ? [{ title: t("contracts.downPayment"), value: fmt(summary.downPayment), icon: faWallet, color: "bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/20" }] : []),
    { title: t("contracts.financed"), value: fmt(summary.financed), icon: faHandHoldingUsd, color: "bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/20" },
    { title: t("contracts.balance"), value: fmt(currentContract?.balance), icon: faChartLine, color: "bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-500/20" },
    ...(!isBankOrCash ? [
      { title: t("contracts.months"), value: summary.term || "—", icon: faCalendarAlt, color: "bg-gradient-to-br from-amber-500 to-amber-700 shadow-amber-500/20" },
      { title: t("contracts.estimatedInstallment"), value: fmt(summary.monthly), icon: faCalculator, color: "bg-gradient-to-br from-cyan-500 to-cyan-700 shadow-cyan-500/20" }
    ] : [])
  ];

  return (
    <div className="px-8 py-8 bg-gray-50/50 dark:bg-darkblack-500/20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-6">
        {cards.map((card, idx) => (
          <SummaryCard
            key={idx}
            {...card}
            delay={idx * 0.04}
          />
        ))}
      </div>
    </div>
  );
};

ContractSummaryCards.propTypes = {
  summary: PropTypes.object,
  currentContract: PropTypes.object,
  fmt: PropTypes.func.isRequired
};

export default ContractSummaryCards;