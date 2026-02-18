import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHistory,
    faReceipt,
    faInfoCircle,
    faLock,
} from "@fortawesome/free-solid-svg-icons";

const PaymentModalHeader = ({ activeTab, setActiveTab, currentContract, isReadOnly, onClose, t }) => {
    return (
        <div className="relative border-b border-gray-100 dark:border-darkblack-500">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-20 w-12 h-12 rounded-2xl flex items-center justify-center bg-white dark:bg-darkblack-500 shadow-xl border border-gray-100 dark:border-darkblack-400 text-gray-400 hover:text-rose-500 transition-all duration-300 group"
            >
                <FontAwesomeIcon icon={faHistory} className="absolute opacity-0 group-hover:opacity-10 scale-150 transition-all" />
                <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            <div className={`relative transition-all duration-500 ${activeTab === 'overview' ? 'p-10' : 'p-6'}`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className={`rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group transition-all duration-500 ${activeTab === 'overview' ? 'w-20 h-20' : 'w-12 h-12'}`}>
                            <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-500" />
                            <FontAwesomeIcon icon={activeTab === 'overview' ? faInfoCircle : activeTab === 'payments' ? faHistory : activeTab === 'ledger' ? faReceipt : faInfoCircle} className={`relative z-10 transition-all ${activeTab === 'overview' ? 'text-3xl' : 'text-xl'}`} />
                        </div>
                        <div>
                            <h3 className={`font-black text-gray-900 dark:text-white tracking-tight leading-none mb-2 transition-all ${activeTab === 'overview' ? 'text-4xl' : 'text-xl'}`}>
                                {activeTab === 'overview' ? t('common.overview') : activeTab === 'payments' ? t('contracts.paymentSchedule') : activeTab === 'ledger' ? t('contracts.ledgerEntries') : t('contracts.contractNotes')}
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100 dark:border-blue-900/30">
                                    {currentContract?.status || "Active"}
                                </span>
                                {isReadOnly && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 dark:bg-rose-900/10 px-2 py-1 rounded-md border border-rose-100 dark:border-rose-900/20">
                                        <FontAwesomeIcon icon={faLock} />
                                        <span>{t('contracts.readOnly')}</span>
                                    </div>
                                )}
                                <span className="text-xs font-bold text-gray-400 truncate max-w-[200px]">
                                    {currentContract?.lot?.name} • {currentContract?.project?.name}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex items-center gap-2 p-1.5 bg-gray-100 dark:bg-darkblack-500/50 rounded-[1.5rem] border border-gray-200 dark:border-darkblack-400/50 shadow-inner">
                        {[
                            { id: 'overview', icon: faInfoCircle, label: t('common.overview') },
                            { id: 'payments', icon: faHistory, label: t('contracts.paymentSchedule') },
                            { id: 'ledger', icon: faReceipt, label: t('contracts.ledgerEntries') },
                            { id: 'notes', icon: faInfoCircle, label: t('contracts.contractNotes') }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-6 py-3 text-[10px] font-black rounded-xl transition-all duration-300 uppercase tracking-widest ${activeTab === tab.id
                                    ? 'bg-white dark:bg-darkblack-600 text-blue-600 dark:text-blue-400 shadow-xl border border-gray-100 dark:border-darkblack-400 scale-[1.05]'
                                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                    }`}
                            >
                                <FontAwesomeIcon icon={tab.icon} />
                                <span className="hidden lg:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModalHeader;
