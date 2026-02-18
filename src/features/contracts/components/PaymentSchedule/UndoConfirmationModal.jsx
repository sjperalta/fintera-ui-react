
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "../../../../contexts/LocaleContext";

const UndoConfirmationModal = ({
    paymentId,
    onConfirm,
    onCancel,
    isLoading
}) => {
    const { t } = useLocale();

    return (
        <AnimatePresence>
            {paymentId != null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-bgray-900/60 dark:bg-black/80 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative bg-white dark:bg-darkblack-600 rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-md border border-gray-100 dark:border-darkblack-400"
                    >
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center text-white text-2xl shadow-xl shadow-rose-500/20">
                                    <FontAwesomeIcon icon={faExclamationTriangle} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                        {t('paymentSchedule.undoConfirmTitle')}
                                    </h4>
                                    <p className="text-sm font-bold text-gray-400 mt-1">
                                        {t('paymentSchedule.undoConfirmMessage')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold rounded-2xl bg-gray-100 dark:bg-darkblack-500 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-darkblack-400 transition-all"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold rounded-2xl bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading
                                        ? t('common.processing')
                                        : t('paymentSchedule.undoPayment')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UndoConfirmationModal;
