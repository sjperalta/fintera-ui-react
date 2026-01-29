import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import { useLocale } from "../../contexts/LocaleContext";
import { useToast } from "../../contexts/ToastContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faReceipt,
  faInfoCircle,
  faLock,
  faCoins,
  faHandHoldingUsd,
  faDollarSign,
  faExclamationTriangle,
  faCalculator,
  faChartLine,
  faCheckCircle,
  faPiggyBank,
  faUser,
  faProjectDiagram,
  faMapMarkerAlt,
  faCalendarAlt,
  faPercent,
  faBolt,
  faClock,
  faPhone,
  faIdCard
} from "@fortawesome/free-solid-svg-icons";
import ProjectLotCards from "./ProjectLotCards";
import CreditScoreCard from "./CreditScoreCard";
import ContractInfoCard from "./ContractInfoCard";
import PaymentScheduleTab from "./PaymentScheduleTab";
import LedgerEntriesTab from "./LedgerEntriesTab";
import ContractSummaryCards from "./ContractSummaryCards";
import ContractNotesTab from "./ContractNotesTab";

function PaymentScheduleModal({ contract, open, onClose, onPaymentSuccess }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMora, setEditingMora] = useState(null);
  const [moratoryAmount, setMoratoryAmount] = useState("");
  const [applyPaymentModal, setApplyPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editableAmount, setEditableAmount] = useState("");
  const [editableInterest, setEditableInterest] = useState("");
  const [editableTotal, setEditableTotal] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [currentContract, setCurrentContract] = useState(() => contract || null);
  const [activeTab, setActiveTab] = useState('overview');
  const [ledgerEntries, setLedgerEntries] = useState([]); // Ensure ledgerEntries is always initialized as an array
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const { showToast } = useToast();
  const token = getToken();
  const { t } = useLocale();

  // Fetch fresh contract details with payment schedule and ledger entries
  const fetchContractDetails = async (contractId) => {
    if (!contractId) return null;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${contract.project_id}/lots/${contract.lot_id}/contracts/${contractId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch contract details');
      }

      const data = await response.json();
      return data.contract || null;
    } catch (error) {
      console.error('Error fetching contract details:', error);
      showToast(t('common.error'), 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load payment schedule and ledger entries from fresh contract data
  const loadContractData = async () => {
    if (!contract?.id) {
      setSchedule([]);
      setLedgerEntries([]);
      return;
    }

    // Fetch fresh contract details with all nested data
    const fullContract = await fetchContractDetails(contract.id);

    if (fullContract) {
      // Update current contract state
      setCurrentContract(fullContract);

      // Set payment schedule
      const paymentSchedule = fullContract.payment_schedule || [];
      setSchedule(Array.isArray(paymentSchedule) ? paymentSchedule : []);

      // Set ledger entries
      const ledger = fullContract.ledger_entries || [];
      setLedgerEntries(Array.isArray(ledger) ? ledger : []);
    } else {
      setSchedule([]);
      setLedgerEntries([]);
    }
  };

  // Handle payment response and update contract balance
  const handlePaymentResponse = (paymentResponse) => {

    // Update the contract balance if included in the response
    if (paymentResponse?.payment?.contract?.balance !== undefined) {
      setCurrentContract(prev => ({
        ...(prev || {}),
        balance: paymentResponse.payment.contract.balance
      }));
    }

    // Reload contract data to refresh payment schedule and ledger
    loadContractData();

    // Call the original callback if provided
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentResponse);
    }
  };

  useEffect(() => {
    if (!open || !contract) {
      return;
    }
    loadContractData();
  }, [open, contract?.id]);

  // Clear state when modal is closed
  useEffect(() => {
    if (!open) {
      setSchedule([]);
      setLedgerEntries([]);
      setLedgerLoading(false);
      setActiveTab('overview');
      setCurrentContract(null);
    }
  }, [open]);

  // Calculate totals
  const totals = useMemo(() => {
    const safeSchedule = Array.isArray(schedule) ? schedule : [];
    const subtotal = safeSchedule.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const totalInterest = safeSchedule.reduce((sum, payment) => sum + Number(payment.interest_amount || 0), 0);
    const total = subtotal + totalInterest;

    return { subtotal, totalInterest, total };
  }, [schedule]);

  const summary = useMemo(() => {
    if (!currentContract) return null;
    const price = Number(currentContract.amount || 0);
    const reserve = Number(currentContract.reserve_amount || 0);
    const financingType = currentContract.financing_type?.toLowerCase();

    // For cash and bank financing, down payment is not applicable
    const downPayment = (financingType === 'cash' || financingType === 'bank')
      ? 0
      : Number(currentContract.down_payment || 0);

    const term = Number(currentContract.payment_term || 0);
    const financed = Math.max(price - (reserve + downPayment), 0);
    const monthly = term ? financed / term : 0;
    const interestRate = Number(currentContract.interest_rate || 0);
    return { price, reserve, downPayment, financed, term, monthly, interestRate };
  }, [currentContract]);

  const activeMonths = useMemo(() => {
    if (!currentContract?.created_at) return 0;
    const start = new Date(currentContract.created_at);
    const end = new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(0, months);
  }, [currentContract?.created_at]);

  // Check if contract is closed (read-only mode)
  const isReadOnly = currentContract?.status?.toLowerCase() === 'closed';

  if (!open) return null;

  if (!contract) {
    return null;
  }

  const fmt = (v) =>
    v === null || v === undefined || v === ""
      ? "—"
      : Number(v).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + " HNL";


  const translatePaymentType = (type) => {
    const normalizedType = type?.toLowerCase().replace(/\s+/g, '_');
    switch (normalizedType) {
      case "reservation": return t('payments.statusOptions.reservation');
      case "down_payment": return t('payments.statusOptions.down_payment');
      case "installment": return t('payments.statusOptions.installment');
      default: return type || t('payments.statusOptions.installment');
    }
  };

  const calculateMoratoryDays = (dueDate) => {
    if (!dueDate) return 0;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-6xl bg-white dark:bg-darkblack-600 rounded-t-2xl md:rounded-2xl shadow-xl max-h-[90vh] flex flex-col">

        {/* Modern Header */}
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

              {/* Tab Navigation moved inside header for a more cohesive look */}
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


        {/* Tab Content */}
        <div className="overflow-auto px-6 pb-6 flex-1">
          {activeTab === 'overview' ? (
            <div className="py-6 space-y-8">
              {/* Unified Health Hub */}
              <div className="bg-white dark:bg-darkblack-600 rounded-[2.5rem] p-8 border border-gray-100 dark:border-darkblack-500 shadow-2xl shadow-blue-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-500/10 transition-all duration-1000" />

                <div className="relative z-10 flex flex-col gap-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center text-sm shadow-sm">
                          <FontAwesomeIcon icon={faChartLine} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{t('contracts.totalValue')}</p>
                      </div>
                      <h4 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {fmt(summary?.price)}
                      </h4>
                    </div>

                    <div className="flex items-center gap-10">
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{t('contracts.paid')}</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                          {fmt((Number(summary?.price || 0) + Number(currentContract?.balance || 0)))}
                        </p>
                      </div>
                      <div className="w-px h-8 bg-gray-100 dark:bg-darkblack-500" />
                      <div className="space-y-1 text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">{t('contracts.balance')}</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                          {fmt(currentContract?.balance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative h-2 bg-gray-100 dark:bg-darkblack-500 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(0, ((Number(summary?.price || 0) + Number(currentContract?.balance || 0)) / Number(summary?.price || 1)) * 100))}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBolt} className="animate-pulse" />
                        {Math.round(((Number(summary?.price || 0) + Number(currentContract?.balance || 0)) / Number(summary?.price || 1)) * 100)}% {t('contracts.completed')}
                      </span>
                      <span className="text-gray-400">{t('contracts.healthIndicator')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Creative Cohesion Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Pod 1: Client & Record - Integrated Credit Score */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-[1.5rem] bg-gray-50/50 dark:bg-darkblack-500/20 border border-gray-100 dark:border-darkblack-400/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                    <FontAwesomeIcon icon={faUser} className="text-6xl" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-500">{t('contracts.clientRecord')}</p>
                      <span className="text-[10px] font-black text-gray-400">
                        {currentContract?.applicant_credit_score || 0}%
                      </span>
                    </div>

                    {/* Horizontal Credit Score Bar */}
                    <div className="relative w-full h-2 bg-gray-100 dark:bg-darkblack-500 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${currentContract?.applicant_credit_score || 0}%`,
                          background: (() => {
                            const score = currentContract?.applicant_credit_score || 0;
                            if (score >= 80) return 'linear-gradient(90deg, #10b981 0%, #059669 100%)'; // Green (Excellent)
                            if (score >= 60) return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'; // Amber (Good)
                            if (score >= 40) return 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)'; // Orange (Fair)
                            return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'; // Red (Poor)
                          })(),
                          boxShadow: (() => {
                            const score = currentContract?.applicant_credit_score || 0;
                            if (score >= 80) return '0 0 15px rgba(16, 185, 129, 0.5)';
                            if (score >= 60) return '0 0 15px rgba(245, 158, 11, 0.5)';
                            if (score >= 40) return '0 0 15px rgba(249, 115, 22, 0.5)';
                            return '0 0 15px rgba(239, 68, 68, 0.5)';
                          })()
                        }}
                      />
                    </div>

                    <div>
                      <h5 className="text-sm font-black text-gray-900 dark:text-white mb-1 truncate">{currentContract?.applicant_name || t('contractInfo.client')}</h5>
                      <p className="text-[10px] font-bold text-gray-400 mb-3 truncate">#{currentContract?.id} · {currentContract?.status || "Active"}</p>

                      {/* Contact Information */}
                      <div className="space-y-2">
                        {currentContract?.applicant_phone && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                            <FontAwesomeIcon icon={faPhone} className="text-[8px] text-gray-300" />
                            <span className="truncate">{currentContract.applicant_phone}</span>
                          </div>
                        )}
                        {currentContract?.applicant_identity && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                            <FontAwesomeIcon icon={faIdCard} className="text-[8px] text-gray-300" />
                            <span className="truncate">{currentContract.applicant_identity}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Pod 2: Lot Information - Specific Specs */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 rounded-[1.5rem] bg-gray-50/50 dark:bg-darkblack-500/20 border border-gray-100 dark:border-darkblack-400/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                    <FontAwesomeIcon icon={faProjectDiagram} className="text-6xl" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-3">{t('contracts.lotInformation')}</p>
                  <h5 className="text-sm font-black text-gray-900 dark:text-white mb-1 truncate">{currentContract?.lot_name || t('contracts.lot')}</h5>
                  <p className="text-[10px] font-bold text-gray-400 mb-3 truncate">{currentContract?.project_name}</p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{t('projects.area')}</span>
                        <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                          {currentContract?.lot_area || "—"} m²
                        </span>
                      </div>
                      <div className="w-px h-5 bg-gray-200 dark:bg-darkblack-400" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{t('projects.dimensions')}</span>
                        <span className="text-[11px] font-black text-gray-500 dark:text-gray-400">
                          {currentContract?.lot_width && currentContract?.lot_length ?
                            `${currentContract.lot_width} x ${currentContract.lot_length}` : "—"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-darkblack-400/50 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[8px]" />
                        <span className="truncate uppercase tracking-tight opacity-80">
                          {currentContract?.lot_address || "—"}
                        </span>
                      </div>
                      {currentContract?.project_address && (
                        <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                          <FontAwesomeIcon icon={faProjectDiagram} className="text-[7px]" />
                          <span className="truncate">
                            {currentContract.project_address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Pod 3: Financial Terms - Interest & Rate */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-[1.5rem] bg-gray-50/50 dark:bg-darkblack-500/20 border border-gray-100 dark:border-darkblack-400/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                    <FontAwesomeIcon icon={faCalendarAlt} className="text-6xl" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-3">{t('contracts.terms')}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{t('contracts.months')}</p>
                      <p className="text-base font-black text-gray-900 dark:text-white">{summary?.term || 0}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{t('contracts.rate')}</p>
                      <p className="text-base font-black text-amber-600">{summary?.interestRate || 0}%</p>
                    </div>
                  </div>
                </motion.div>

                {/* Pod 4: Timeline - Creation & Dates */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-[1.5rem] bg-gray-50/50 dark:bg-darkblack-500/20 border border-gray-100 dark:border-darkblack-400/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                    <FontAwesomeIcon icon={faHistory} className="text-6xl" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-3">{t('contracts.timeline')}</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{t('contractInfo.created')}</p>
                      <p className="text-[10px] font-bold text-gray-900 dark:text-white">
                        {currentContract?.created_at ? new Date(currentContract.created_at).toLocaleDateString() : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="text-[10px] text-gray-400" />
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                        {t('contracts.activeSince')} {activeMonths} {t('common.months.jan').toLowerCase() === 'ene' ? 'meses' : 'months'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom Detail Row (Reserve/Downpayment etc) */}
              <div className="bg-gray-50/30 dark:bg-darkblack-500/10 rounded-3xl p-6 border border-gray-100/50 dark:border-darkblack-400/30 flex flex-wrap items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center text-xs">
                    <FontAwesomeIcon icon={faCoins} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('contracts.reserve')}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{fmt(summary?.reserve)}</p>
                  </div>
                </div>
                <div className="h-4 w-px bg-gray-200 dark:bg-darkblack-400 hidden md:block" />
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center text-xs">
                    <FontAwesomeIcon icon={faHandHoldingUsd} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('contracts.downPayment')}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{fmt(summary?.downPayment)}</p>
                  </div>
                </div>
                <div className="h-4 w-px bg-gray-200 dark:bg-darkblack-400 hidden md:block" />
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center text-xs">
                    <FontAwesomeIcon icon={faCalculator} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('contracts.financed')}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{fmt(summary?.financed)}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'payments' ? (
            <PaymentScheduleTab
              loading={loading}
              schedule={schedule}
              totals={totals}
              isReadOnly={isReadOnly}
              fmt={fmt}
              translatePaymentType={translatePaymentType}
              calculateMoratoryDays={calculateMoratoryDays}
              setSelectedPayment={setSelectedPayment}
              setEditableAmount={setEditableAmount}
              setEditableInterest={setEditableInterest}
              setEditableTotal={setEditableTotal}
              setApplyPaymentModal={setApplyPaymentModal}
              setEditingMora={setEditingMora}
              setMoratoryAmount={setMoratoryAmount}
              setSchedule={setSchedule}
              setCurrentContract={setCurrentContract}
              onPaymentSuccess={onPaymentSuccess}
              currentContract={currentContract}
            />
          ) : activeTab === 'ledger' ? (
            <LedgerEntriesTab
              ledgerLoading={ledgerLoading}
              ledgerEntries={ledgerEntries}
              fmt={fmt}
            />
          ) : (
            <ContractNotesTab
              currentContract={currentContract}
              onContractUpdate={setCurrentContract}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-bgray-200 dark:border-darkblack-400 flex justify-between items-center">
          {activeTab === 'payments' && !isReadOnly ? (
            <button
              onClick={() => {
                setSelectedPayment({ isCapitalPayment: true, number: "Capital" });
                setEditableAmount("");
                setEditableInterest("0");
                setEditableTotal("");
                setApplyPaymentModal(true);
              }}
              className="px-8 py-3 text-xs font-black uppercase tracking-widest rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 transition-all duration-300 flex items-center gap-3 transform hover:scale-105 active:scale-95"
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
      </div>

      {/* Apply Payment Modal */}
      <AnimatePresence>
        {applyPaymentModal && selectedPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setApplyPaymentModal(false)}
              className="absolute inset-0 bg-bgray-900/60 dark:bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-darkblack-600 rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-lg border border-gray-100 dark:border-darkblack-400"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl ${selectedPayment?.isCapitalPayment ? "bg-emerald-500 shadow-emerald-500/20" : "bg-blue-600 shadow-blue-500/20"}`}>
                    <FontAwesomeIcon icon={selectedPayment?.isCapitalPayment ? faHandHoldingUsd : faCoins} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      {selectedPayment?.isCapitalPayment ? t('contracts.capitalPayment') : t('contracts.applyPayment')}
                    </h4>
                    <p className="text-sm font-bold text-gray-400">
                      {selectedPayment?.isCapitalPayment
                        ? t('contracts.capitalPaymentDescription')
                        : `${t('contracts.paymentFor')} #${selectedPayment.id}`
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                      {selectedPayment?.isCapitalPayment ? t('contracts.capitalPaymentAmount') : t('contracts.paymentAmount')}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faDollarSign} className="text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={editableAmount}
                        onChange={(e) => {
                          const newAmount = e.target.value;
                          setEditableAmount(newAmount);
                          if (!selectedPayment?.isCapitalPayment) {
                            const amount = parseFloat(newAmount) || 0;
                            const interest = parseFloat(editableInterest) || 0;
                            setEditableTotal((amount + interest).toString());
                          }
                        }}
                        placeholder={selectedPayment?.isCapitalPayment ? t('contracts.enterCapitalPaymentAmount') : ""}
                        className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-darkblack-500 border-2 border-transparent focus:border-blue-500/50 rounded-2xl dark:text-white font-bold transition-all outline-none"
                      />
                    </div>
                  </div>

                  {!selectedPayment?.isCapitalPayment && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                          {t('contracts.interestMoratory')}
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-400" />
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            value={editableInterest}
                            onChange={(e) => {
                              const newInterest = e.target.value;
                              setEditableInterest(newInterest);
                              const amount = parseFloat(editableAmount) || 0;
                              const interest = parseFloat(newInterest) || 0;
                              setEditableTotal((amount + interest).toString());
                            }}
                            className="w-full pl-10 pr-4 py-4 bg-amber-50/50 dark:bg-amber-900/10 border-2 border-transparent focus:border-amber-500/50 rounded-2xl dark:text-white font-bold transition-all outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                          {t('contracts.totalPaymentAmount')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faCalculator} className="text-blue-500" />
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            value={editableTotal}
                            readOnly
                            className="w-full pl-10 pr-4 py-4 bg-blue-50/50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 font-black transition-all outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl border-2 flex gap-3 ${selectedPayment?.isCapitalPayment ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20"}`}>
                    <FontAwesomeIcon icon={faInfoCircle} className={`mt-1 ${selectedPayment?.isCapitalPayment ? "text-emerald-500" : "text-amber-500"}`} />
                    <p className={`text-xs font-bold leading-relaxed ${selectedPayment?.isCapitalPayment ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}>
                      {selectedPayment?.isCapitalPayment ? t('contracts.capitalPaymentInfo') : t('contracts.amountInterestWarning')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-10">
                  <button
                    onClick={() => {
                      setApplyPaymentModal(false);
                      setSelectedPayment(null);
                    }}
                    className="flex-1 px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl bg-gray-50 dark:bg-darkblack-500 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all border border-transparent hover:border-gray-200 dark:hover:border-darkblack-400"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={async () => {
                      setActionLoading(true);
                      try {
                        const paymentAmount = parseFloat(editableAmount) || 0;

                        if (selectedPayment?.isCapitalPayment) {
                          // Handle capital payment (abono a capital)
                          if (paymentAmount <= 0) {
                            showToast(t('contracts.capitalPaymentAmountRequired'), "error");
                            setActionLoading(false);
                            return;
                          }

                          // Make API call for capital payment - this usually goes to contracts endpoint
                          const response = await fetch(
                            `${API_URL}/api/v1/projects/${currentContract?.project_id}/lots/${currentContract?.lot_id}/contracts/${currentContract?.id}/capital_repayment`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                contract: {
                                  capital_repayment_amount: paymentAmount
                                }
                              }),
                            }
                          );

                          if (!response.ok) {
                            const errorData = await response.json().catch(() => ({}));
                            throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
                          }

                          const data = await response.json();

                          // Update contract with new balance from backend
                          if (data.contract) {
                            setCurrentContract(prev => ({
                              ...(prev || {}),
                              ...data.contract,
                              balance: data.contract.balance
                            }));
                          }

                          // Update schedule with readjusted payments from backend
                          if (data.reajusted_payments && Array.isArray(data.reajusted_payments) && data.reajusted_payments.length > 0) {
                            const safeSchedule = Array.isArray(schedule) ? schedule : [];

                            // Replace existing payments with readjusted ones from backend
                            const updatedSchedule = safeSchedule.map(payment => {
                              // Find if this payment was readjusted
                              const reajustedPayment = data.reajusted_payments.find(rp => rp.id === payment.id);
                              if (reajustedPayment) {
                                // Use the complete payment data from backend
                                return {
                                  ...reajustedPayment,
                                  status: 'readjustment',
                                  readjusted_at: new Date().toISOString()
                                };
                              }
                              return payment;
                            });
                            setSchedule(updatedSchedule);

                            // IMPORTANT: Update the contract's payment_schedule to persist readjustment status
                            // This ensures that when modal reopens, the readjustment status is maintained
                            setCurrentContract(prev => ({
                              ...(prev || {}),
                              payment_schedule: updatedSchedule
                            }));
                          }

                          // Call the original callback if provided
                          if (onPaymentSuccess) {
                            onPaymentSuccess({
                              payment: {
                                amount: paymentAmount,
                                contract: data.contract || {
                                  id: currentContract?.id,
                                  balance: data.contract?.balance || (currentContract?.balance || 0) - paymentAmount,
                                  status: currentContract?.status,
                                  created_at: currentContract?.created_at,
                                  currency: currentContract?.currency || "HNL"
                                }
                              },
                              reajusted_payments_count: data.reajusted_payments_count || 0,
                              reajusted_payments: data.reajusted_payments || []
                            });
                          }

                          // Note: Don't reload payment schedule here as it would overwrite the readjusted payments
                          // The schedule has already been updated with the readjusted payments from backend

                          // Show success feedback for capital payment
                          let successMessage = `${t('contracts.capitalPayment')} ${t('contracts.appliedSuccessfully')}`;
                          if (data.reajusted_payments_count > 0) {
                            successMessage += ` - ${data.reajusted_payments_count} ${t('contracts.paymentsReadjusted')}`;
                          }
                          showToast(successMessage, "success");

                        } else {
                          // Handle regular payment - Make API call to apply payment
                          const interestAmount = parseFloat(editableInterest) || 0;
                          const paidAmount = parseFloat(editableTotal) || 0;

                          if (paidAmount <= 0) {
                            showToast(t('contracts.totalAmountRequired'), "error");
                            setActionLoading(false);
                            return;
                          }

                          // Make API call to approve payment
                          const response = await fetch(
                            `${API_URL}/api/v1/payments/${selectedPayment.id}/approve`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                payment: {
                                  amount: parseFloat(editableAmount) || 0,
                                  interest_amount: interestAmount,
                                  paid_amount: paidAmount
                                }
                              }),
                            }
                          );

                          if (!response.ok) {
                            const errorData = await response.json().catch(() => ({}));
                            throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
                          }

                          const data = await response.json();

                          // Update the payment in the local schedule
                          const safeSchedule = Array.isArray(schedule) ? schedule : [];
                          const updatedSchedule = safeSchedule.map(payment =>
                            payment.id === selectedPayment.id
                              ? {
                                ...payment,
                                status: data.payment.status || 'paid',
                                paid_amount: data.payment.amount,
                                interest_amount: data.payment.interest_amount,
                                payment_date: data.payment.payment_date,
                                approved_at: data.payment.approved_at
                              }
                              : payment
                          );
                          setSchedule(updatedSchedule);

                          // Handle the payment response and update balance
                          handlePaymentResponse(data);

                          // Show success feedback for regular payment
                          showToast(`${t('contracts.payment')} ${t('contracts.appliedSuccessfully')}`, "success");

                        }

                        setTimeout(() => {
                          setApplyPaymentModal(false);
                          setSelectedPayment(null);
                          setEditableAmount("");
                          setEditableInterest("");
                          setEditableTotal("");
                          setActionLoading(false);
                        }, 500);
                      } catch (error) {
                        console.error('Error applying payment:', error);
                        const paymentType = selectedPayment?.isCapitalPayment ? t('contracts.capitalPayment').toLowerCase() : t('contracts.payment').toLowerCase();
                        showToast(`${t('contracts.errorApplying')} ${paymentType}: ${error.message}`, "error");
                        setActionLoading(false);
                      }
                    }}
                    disabled={actionLoading}
                    className={`flex-[2] px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl text-white shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] ${selectedPayment?.isCapitalPayment
                      ? "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-600"
                      : "bg-blue-600 shadow-blue-500/20 hover:bg-blue-700"
                      }`}
                  >
                    {actionLoading
                      ? (selectedPayment?.isCapitalPayment ? t('contracts.applyingCapitalPayment') : t('contracts.applyingPayment'))
                      : (selectedPayment?.isCapitalPayment ? t('contracts.applyCapitalPayment') : t('contracts.applyPayment'))
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Moratory Modal */}
      <AnimatePresence>
        {editingMora !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingMora(null)}
              className="absolute inset-0 bg-bgray-900/60 dark:bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-darkblack-600 rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-lg border border-gray-100 dark:border-darkblack-400"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white text-2xl shadow-xl shadow-amber-500/20">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      {t('contracts.editMoratory')}
                    </h4>
                    <p className="text-sm font-bold text-gray-400">
                      {t('contracts.updateMoratoryInfo')}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">
                      {t('contracts.moratoryInterest')}
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FontAwesomeIcon icon={faCalculator} className="text-amber-500 group-focus-within:scale-110 transition-transform" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={moratoryAmount}
                        onChange={(e) => setMoratoryAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-darkblack-500 border-2 border-transparent focus:border-amber-500/50 rounded-2xl dark:text-white font-bold transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/20 flex gap-3">
                    <FontAwesomeIcon icon={faInfoCircle} className="mt-1 text-blue-500" />
                    <p className="text-xs font-bold leading-relaxed text-blue-700 dark:text-blue-300">
                      {t('contracts.moratoryEditWarning')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-10">
                  <button
                    onClick={() => setEditingMora(null)}
                    className="flex-1 px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl bg-gray-50 dark:bg-darkblack-500 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={async () => {
                      setActionLoading(true);
                      try {
                        const newMora = parseFloat(moratoryAmount) || 0;
                        const response = await fetch(
                          `${API_URL}/api/v1/payments/${editingMora}/update_moratory`,
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              payment: {
                                interest_amount: newMora
                              }
                            }),
                          }
                        );

                        if (!response.ok) throw new Error("Error updating moratory");

                        const data = await response.json();

                        // Update local schedule
                        const safeSchedule = Array.isArray(schedule) ? schedule : [];
                        const updatedSchedule = safeSchedule.map(payment =>
                          payment.id === editingMora
                            ? { ...payment, interest_amount: data.payment.interest_amount }
                            : payment
                        );
                        setSchedule(updatedSchedule);

                        showToast(t('contracts.moratoryUpdated'), "success");
                        setEditingMora(null);
                      } catch (error) {
                        showToast(t('contracts.errorUpdatingMoratory'), "error");
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    disabled={actionLoading}
                    className="flex-[2] px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl bg-amber-500 text-white shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all transform hover:scale-[1.02]"
                  >
                    {actionLoading ? t('common.loading') : t('common.save')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

PaymentScheduleModal.propTypes = {
  contract: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onPaymentSuccess: PropTypes.func,
};

export default PaymentScheduleModal;