import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandHoldingUsd } from "@fortawesome/free-solid-svg-icons";

const PaymentModalFooter = ({ activeTab, isReadOnly, onCapitalPayment, ledgerEntries, onClose, t }) => {
    return (
        <div className="px-6 py-4 border-t border-bgray-200 dark:border-darkblack-400 flex justify-between items-center">
            {activeTab === 'payments' && !isReadOnly ? (
                <button
                    onClick={onCapitalPayment}
                    className="px-8 py-3 text-xs font-black uppercase tracking-widest rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 transition-all duration-300 flex items-center gap-3 transform hover:scale-105 active:scale-95"
                >
                    <FontAwesomeIcon icon={faHandHoldingUsd} />
                    {t('contracts.capitalPayment')}
                </button>
            ) : (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    {activeTab === 'ledger' ? (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {(Array.isArray(ledgerEntries) ? ledgerEntries : []).length} {t('contracts.entriesRegistered')} | {t('contracts.ledgerReadOnly')}
                        </>
                    ) : activeTab === 'notes' ? (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            {t('contracts.contractNotesInfo')}
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            {t('contracts.contractClosedReadOnly')}
                        </>
                    )}
                </div>
            )}
            <button
                onClick={onClose}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-bgray-200 hover:bg-bgray-300 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 text-bgray-800 dark:text-bgray-100"
            >
                {t('common.cancel')}
            </button>
        </div>
    );
};

export default PaymentModalFooter;
