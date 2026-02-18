import PropTypes from 'prop-types';
import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faHistory,
} from '@fortawesome/free-solid-svg-icons';
import { useLocale } from '../../../contexts/LocaleContext';

import PaymentRow from './PaymentSchedule/PaymentRow';
import PaymentScheduleHeader from './PaymentSchedule/PaymentScheduleHeader';
import PaymentScheduleFooter from './PaymentSchedule/PaymentScheduleFooter';

const PaymentScheduleTab = memo(function PaymentScheduleTab({
  loading,
  schedule,
  totals,
  isReadOnly,
  fmt,
  translatePaymentType,
  calculateMoratoryDays,
  setSelectedPayment,
  setApplyPaymentModal,
  setEditingMora,
  setMoratoryAmount,
  onUndoPayment,
  undoLoadingPaymentId
}) {
  const { t } = useLocale();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 bg-gray-50/30 dark:bg-darkblack-600/30 rounded-[3rem] border border-gray-100 dark:border-darkblack-500">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <FontAwesomeIcon icon={faClock} className="text-blue-500 animate-pulse" />
          </div>
        </div>
        <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-gray-400">{t('paymentSchedule.loading')}</p>
      </div>
    );
  }

  const safeSchedule = Array.isArray(schedule) ? schedule : [];

  // Progress Calculations
  const totalSteps = safeSchedule.length || 1;
  const paidSteps = safeSchedule.filter(p => p.status?.toLowerCase() === 'paid').length;
  const overdueSteps = safeSchedule.filter(p => {
    const s = p.status?.toLowerCase() || 'pending';
    const mora = calculateMoratoryDays(p.due_date);
    return s !== 'paid' && s !== 'readjustment' && mora > 0;
  }).length;
  const progressPercent = (paidSteps / totalSteps) * 100;

  return (
    <div className="space-y-12 py-4">
      <PaymentScheduleHeader
        paidSteps={paidSteps}
        totalSteps={totalSteps}
        overdueSteps={overdueSteps}
        progressPercent={progressPercent}
        t={t}
      />

      <div className="relative pl-8 md:pl-12">
        <div className="absolute left-4 md:left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-transparent rounded-full opacity-10" />

        <div className="space-y-4">
          {safeSchedule.length === 0 ? (
            <div className="py-20 text-center">
              <FontAwesomeIcon icon={faHistory} className="text-5xl text-gray-100 dark:text-gray-800 mb-4" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('paymentSchedule.noScheduleAvailable')}</p>
            </div>
          ) : (
            <AnimatePresence>
              {safeSchedule.map((row, idx) => (
                <PaymentRow
                  key={row.id || idx}
                  row={row}
                  idx={idx}
                  paidSteps={paidSteps}
                  fmt={fmt}
                  t={t}
                  translatePaymentType={translatePaymentType}
                  calculateMoratoryDays={calculateMoratoryDays}
                  setSelectedPayment={setSelectedPayment}
                  setApplyPaymentModal={setApplyPaymentModal}
                  setEditingMora={setEditingMora}
                  setMoratoryAmount={setMoratoryAmount}
                  onUndoPayment={onUndoPayment}
                  undoLoadingPaymentId={undoLoadingPaymentId}
                  isReadOnly={isReadOnly}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <PaymentScheduleFooter
        totals={totals}
        fmt={fmt}
        t={t}
      />
    </div>
  );
});

PaymentScheduleTab.propTypes = {
  loading: PropTypes.bool,
  schedule: PropTypes.array,
  totals: PropTypes.object,
  isReadOnly: PropTypes.bool,
  fmt: PropTypes.func.isRequired,
  translatePaymentType: PropTypes.func.isRequired,
  calculateMoratoryDays: PropTypes.func.isRequired,
  setSelectedPayment: PropTypes.func.isRequired,
  setApplyPaymentModal: PropTypes.func.isRequired,
  setEditingMora: PropTypes.func.isRequired,
  setMoratoryAmount: PropTypes.func.isRequired,
  onUndoPayment: PropTypes.func,
  undoLoadingPaymentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default PaymentScheduleTab;