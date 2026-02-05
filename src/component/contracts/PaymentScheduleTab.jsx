import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faCheckCircle,
  faExclamationTriangle,
  faUndo,
  faReceipt,
  faLock,
  faHistory,
  faCoins,
  faCalculator,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { useLocale } from '../../contexts/LocaleContext';

const PaymentScheduleTab = ({
  loading,
  schedule,
  totals,
  isReadOnly,
  fmt,
  translatePaymentType,
  calculateMoratoryDays,
  setSelectedPayment,
  setEditableAmount,
  setEditableInterest,
  setEditableTotal,
  setApplyPaymentModal,
  setEditingMora,
  setMoratoryAmount,
  onUndoPayment,
  undoLoadingPaymentId
}) => {
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

  const getStatusConfig = (p) => {
    const status = (p.status || 'pending').toLowerCase();
    const isReadjustment = status === "readjustment";
    const moratoryDays = calculateMoratoryDays(p.due_date);
    const isPaid = status === "paid";
    const isOverdue = !isPaid && !isReadjustment && moratoryDays > 0;

    if (isReadjustment) return {
      label: t('paymentSchedule.readjustment'),
      color: 'gray',
      dotColor: 'bg-gray-300 dark:bg-gray-600',
      textColor: 'text-gray-400',
      badge: 'bg-gray-100 dark:bg-gray-800 text-gray-500',
      icon: faLock
    };
    if (isPaid) return {
      label: t('paymentSchedule.paid'),
      color: 'blue',
      dotColor: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30',
      icon: faCheckCircle
    };
    if (isOverdue) return {
      label: t('paymentSchedule.overdue'),
      color: 'rose',
      dotColor: 'bg-rose-500',
      textColor: 'text-rose-600 dark:text-rose-400',
      badge: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30',
      icon: faExclamationTriangle
    };
    return {
      label: t('paymentSchedule.pending'),
      color: 'amber',
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30',
      icon: faClock
    };
  };

  return (
    <div className="space-y-12 py-4">
      {/* Dynamic Progress Header */}
      <div className="bg-white dark:bg-darkblack-600 rounded-[2rem] p-6 border border-gray-100 dark:border-darkblack-500 shadow-2xl shadow-blue-500/5">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">{t('paymentSchedule.summary')}</p>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {paidSteps} <span className="text-gray-300 dark:text-gray-600 font-medium">/</span> {totalSteps}
              <span className="text-sm font-bold text-gray-400 ml-2">{t('paymentSchedule.completed')}</span>
            </h4>
          </div>

          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-1">{t('paymentSchedule.overdue')}</p>
              <p className="text-lg font-black text-rose-500">{overdueSteps}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">{t('paymentSchedule.remaining')}</p>
              <p className="text-lg font-black text-blue-500">{totalSteps - paidSteps}</p>
            </div>
          </div>
        </div>

        <div className="relative h-3 bg-gray-100 dark:bg-darkblack-500 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "circOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          />
        </div>
      </div>

      {/* Styled Payment List */}
      <div className="relative pl-8 md:pl-12">
        {/* Timeline Axis */}
        <div className="absolute left-4 md:left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-indigo-500 to-transparent rounded-full opacity-10" />

        <div className="space-y-4">
          {safeSchedule.length === 0 ? (
            <div className="py-20 text-center">
              <FontAwesomeIcon icon={faHistory} className="text-5xl text-gray-100 dark:text-gray-800 mb-4" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('paymentSchedule.noScheduleAvailable')}</p>
            </div>
          ) : (
            <AnimatePresence>
              {safeSchedule.map((row, idx) => {
                const statusConfig = getStatusConfig(row);
                const amount = row.amount || row.value || row.payment_amount;
                const paidAmount = row.paid_amount || 0;
                const interest = row.interest_amount || 0;
                const totalRequired = Number(amount) + Number(interest);
                const extraAmount = paidAmount > totalRequired ? paidAmount - totalRequired : 0;
                const moratoryDays = calculateMoratoryDays(row.due_date);
                const isReadjustment = row.status?.toLowerCase() === 'readjustment';
                const isPaid = row.status?.toLowerCase() === 'paid';
                const isUpcoming = !isPaid && !isReadjustment && idx === paidSteps;

                return (
                  <motion.div
                    key={row.id || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`relative group flex flex-col md:flex-row items-stretch md:items-center gap-4 p-1 rounded-xl transition-all duration-300 ${isReadjustment ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                  >
                    {/* Status Node */}
                    <div className="absolute -left-8 md:-left-12 top-1/2 -translate-y-1/2 z-10">
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className={`w-6 h-6 rounded-full border-4 border-white dark:border-darkblack-600 shadow-lg ${statusConfig.dotColor} ${isUpcoming ? 'ring-4 ring-blue-500/20' : ''}`}
                      />
                    </div>

                    {/* Main Content Card */}
                    <div className={`flex-1 flex flex-col md:flex-row items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 ${isUpcoming ? 'bg-blue-50/30 dark:bg-blue-900/10 border-blue-500 shadow-xl shadow-blue-500/10' : 'bg-white dark:bg-darkblack-600 border-gray-50 dark:border-darkblack-500 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl hover:shadow-blue-500/5'}`}>

                      {/* Installment Badge */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${isUpcoming ? 'bg-blue-600 text-white' : (row.payment_type === 'capital_repayment' ? 'bg-emerald-500 text-white' : 'bg-gray-50 dark:bg-darkblack-500 text-gray-400')}`}>
                          <p className="text-[8px] font-black uppercase mb-0.5 opacity-60">
                            {row.payment_type === 'capital_repayment' ? 'Abono' : 'Cuota'}
                          </p>
                          <p className="text-lg font-black">{row.payment_type === 'capital_repayment' ? <FontAwesomeIcon icon={faCoins} className="text-sm" /> : (row.number || idx + 1)}</p>
                        </div>
                      </div>

                      {/* Date & Type */}
                      <div className="flex-1 min-w-0 flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-full md:w-28 text-center md:text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('paymentSchedule.date')}</p>
                          <p className="text-[13px] font-black text-gray-900 dark:text-white truncate">
                            {row.due_date ? new Date(row.due_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : "—"}
                          </p>
                        </div>

                        <div className="w-full md:w-32 text-center md:text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('paymentSchedule.type')}</p>
                          <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-darkblack-500 text-[9px] font-black text-gray-500 uppercase">
                            {translatePaymentType(row.payment_type)}
                          </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('paymentSchedule.amount')}</p>
                          <div className="flex flex-col md:flex-row items-baseline gap-2">
                            <p className={`text-xl font-black ${isUpcoming ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                              {fmt(amount)}
                            </p>
                            {(interest > 0 || moratoryDays > 0) && (
                              <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-900/20">
                                <FontAwesomeIcon icon={faExclamationTriangle} className="text-rose-500 text-[7px]" />
                                <span className="text-[9px] font-black text-rose-600 dark:text-rose-400">+{fmt(interest)}</span>
                              </div>
                            )}
                            {extraAmount > 0 && (
                              <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20">
                                <FontAwesomeIcon icon={faPlus} className="text-blue-500 text-[7px]" />
                                <span className="text-[9px] font-black text-blue-600 dark:text-blue-400">+{fmt(extraAmount)} ({t('paymentSchedule.extraAmount')})</span>
                              </div>
                            )}
                          </div>
                          {isPaid && paidAmount > totalRequired && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-1 flex items-center gap-2"
                            >
                              <div className="px-1.5 py-0.5 bg-blue-500/10 rounded-md flex items-center gap-1.5 group/applied">
                                <FontAwesomeIcon icon={faReceipt} className="text-[8px] text-blue-500 opacity-60 group-hover/applied:scale-110 transition-transform" />
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter opacity-70">
                                  {t('payments.totalApplied') || 'Total Recibido'}: {fmt(paidAmount)}
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Status Label */}
                      <div className="flex-shrink-0 flex items-center gap-4">
                        {moratoryDays > 0 && !isPaid && (
                          <div className="hidden lg:flex flex-col items-end">
                            <p className="text-[9px] font-black uppercase text-rose-400 tracking-tighter">Mora</p>
                            <p className="text-xs font-black text-rose-500">{moratoryDays}d</p>
                          </div>
                        )}
                        <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${statusConfig.badge}`}>
                          <FontAwesomeIcon icon={statusConfig.icon} className="text-[10px]" />
                          {statusConfig.label}
                        </div>
                      </div>

                      {/* Integrated Actions */}
                      <div className="flex-shrink-0 h-full border-l border-gray-100 dark:border-darkblack-500 pl-6 flex items-center gap-2">
                        {isReadjustment ? (
                          <FontAwesomeIcon icon={faLock} className="text-gray-300" />
                        ) : (
                          <>
                            {!isReadOnly && !isPaid && (
                              <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: '#10B981' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setSelectedPayment(row);
                                  setEditableAmount(amount?.toString() || "");
                                  setEditableInterest(interest?.toString() || "");
                                  setEditableTotal(((Number(amount) || 0) + (Number(interest) || 0)).toString());
                                  setApplyPaymentModal(true);
                                }}
                                className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center transition-colors"
                                title={t('paymentSchedule.applyPayment')}
                              >
                                <FontAwesomeIcon icon={faCoins} />
                              </motion.button>
                            )}

                            {!isReadOnly && !isPaid && moratoryDays > 0 && (
                              <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: '#F59E0B', color: '#fff' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setEditingMora(row.id || idx);
                                  setMoratoryAmount(interest?.toString() || "0");
                                }}
                                className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center transition-colors"
                                title={t('paymentSchedule.editMoratory')}
                              >
                                <FontAwesomeIcon icon={faExclamationTriangle} />
                              </motion.button>
                            )}

                            {isPaid && !isReadOnly && (
                              <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: '#EF4444', color: '#fff' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onUndoPayment?.(row.id)}
                                disabled={undoLoadingPaymentId != null && undoLoadingPaymentId === row.id}
                                className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={t('paymentSchedule.undoPayment')}
                              >
                                {undoLoadingPaymentId === row.id ? (
                                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="inline-block w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full" />
                                ) : (
                                  <FontAwesomeIcon icon={faUndo} className="text-xs" />
                                )}
                              </motion.button>
                            )}

                            {isReadOnly && isPaid && (
                              <div className="w-10 h-10 flex items-center justify-center text-emerald-500 opacity-60">
                                <FontAwesomeIcon icon={faCheckCircle} />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Modern Totals Footer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-16 bg-white dark:bg-darkblack-600 rounded-[3rem] border border-gray-100 dark:border-darkblack-500 shadow-2xl overflow-hidden p-1"
      >
        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-darkblack-600 dark:to-darkblack-500 p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-12">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Total Capital</p>
              <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{fmt(totals.subtotal)}</p>
            </div>
            <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-darkblack-400" />
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">{t('paymentSchedule.interest')}</p>
              <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{fmt(totals.totalInterest)}</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] opacity-10 group-hover:opacity-20 transition-opacity blur-xl" />
            <div className="relative flex items-center gap-6 bg-white dark:bg-darkblack-500 border border-gray-100 dark:border-darkblack-400 p-4 rounded-[2rem] shadow-xl">
              <div className="w-14 h-14 rounded-[1.25rem] bg-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">
                <FontAwesomeIcon icon={faCalculator} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">{t('paymentSchedule.totalToPay')}</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">
                  {fmt(totals.total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

PaymentScheduleTab.propTypes = {
  loading: PropTypes.bool,
  schedule: PropTypes.array,
  totals: PropTypes.object,
  isReadOnly: PropTypes.bool,
  fmt: PropTypes.func.isRequired,
  translatePaymentType: PropTypes.func.isRequired,
  calculateMoratoryDays: PropTypes.func.isRequired,
  setSelectedPayment: PropTypes.func.isRequired,
  setEditableAmount: PropTypes.func.isRequired,
  setEditableInterest: PropTypes.func.isRequired,
  setEditableTotal: PropTypes.func.isRequired,
  setApplyPaymentModal: PropTypes.func.isRequired,
  setEditingMora: PropTypes.func.isRequired,
  setMoratoryAmount: PropTypes.func.isRequired,
  onUndoPayment: PropTypes.func,
  undoLoadingPaymentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default PaymentScheduleTab;