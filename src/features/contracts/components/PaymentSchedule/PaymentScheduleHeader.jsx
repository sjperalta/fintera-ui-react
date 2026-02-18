import { motion } from 'framer-motion';

const PaymentScheduleHeader = ({ paidSteps, totalSteps, overdueSteps, progressPercent, t }) => {
    return (
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
    );
};

export default PaymentScheduleHeader;
