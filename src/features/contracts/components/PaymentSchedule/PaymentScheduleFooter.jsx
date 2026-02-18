import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';

const PaymentScheduleFooter = ({ totals, fmt, t }) => {
    return (
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
    );
};

export default PaymentScheduleFooter;
