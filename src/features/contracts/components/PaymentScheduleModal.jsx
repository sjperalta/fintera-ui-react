
import { useEffect, useMemo, useState, useContext, useCallback, memo } from "react";
import { AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import { contractsApi } from "../api";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import AuthContext from "@/contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHistory,
  faReceipt,
  faInfoCircle,
  faLock,
  faHandHoldingUsd,
} from "@fortawesome/free-solid-svg-icons";

import PaymentScheduleTab from "./PaymentScheduleTab";
import LedgerEntriesTab from "./LedgerEntriesTab";
import ContractNotesTab from "./ContractNotesTab";

// New sub-components
import PaymentSummary from "./PaymentSchedule/PaymentSummary";
import ApplyPaymentModal from "./PaymentSchedule/ApplyPaymentModal";
import EditMoratoryModal from "./PaymentSchedule/EditMoratoryModal";
import UndoConfirmationModal from "./PaymentSchedule/UndoConfirmationModal";

// Moved outside component to prevent recreation on every render
const fmt = (v) =>
  v === null || v === undefined || v === ""
    ? "—"
    : Number(v).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " HNL";

// Moved outside component as it's a pure function
const calculateMoratoryDays = (dueDate) => {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

function PaymentScheduleModal({ contract, open, onClose, onPaymentSuccess }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMora, setEditingMora] = useState(null);
  const [moratoryAmount, setMoratoryAmount] = useState("");
  const [applyPaymentModal, setApplyPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // These editable states are now managed inside ApplyPaymentModal, 
  // but if we want to pre-fill them or share state, we might need them.
  // Ideally ApplyPaymentModal should manage its own form state. 
  // However, PaymentScheduleTab sets selectedPayment and potentially pre-fills values.
  // Let's rely on ApplyPaymentModal's internal state initialization based on selectedPayment.

  const [undoLoadingPaymentId, setUndoLoadingPaymentId] = useState(null);
  const [undoConfirmPaymentId, setUndoConfirmPaymentId] = useState(null);
  const [currentContract, setCurrentContract] = useState(() => contract || null);
  const [activeTab, setActiveTab] = useState('overview');
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  const { showToast } = useToast();
  const { t } = useLocale();
  const { user: currentUser } = useContext(AuthContext);

  const fetchContractDetails = useCallback(async (contractId) => {
    if (!contractId) return null;

    setLoading(true);
    try {
      const data = await contractsApi.getDetails(contract.project_id, contract.lot_id, contractId);
      return data.contract || null;
    } catch (error) {
      console.error('Error fetching contract details:', error);
      showToast(t('common.error'), 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [contract.project_id, contract.lot_id, showToast, t]);

  const loadContractData = useCallback(async () => {
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
  }, [contract?.id, fetchContractDetails]);

  // Handle payment response from ApplyPaymentModal or other sources
  const handlePaymentResponse = useCallback((paymentResponse, isCapitalPayment) => {
    // API may return contract at paymentResponse.contract or paymentResponse.payment.contract
    const updatedContract = paymentResponse?.contract ?? paymentResponse?.payment?.contract;

    // Capital payment response structure might be different
    if (updatedContract && (updatedContract.balance !== undefined || updatedContract.total_paid !== undefined)) {
      setCurrentContract((prev) => ({
        ...(prev || {}),
        ...(updatedContract.balance !== undefined && { balance: updatedContract.balance }),
        ...(updatedContract.total_paid !== undefined && { total_paid: updatedContract.total_paid }),
      }));
    }

    // Reload contract data to refresh payment schedule and ledger (especially for capital payments that readjust everything)
    // Optimization: ApplyPaymentModal already updates schedule optimistically for regular payments, 
    // but for capital payments we probably want to reload or use the returned schedule.
    // The original code reloaded.
    if (isCapitalPayment || paymentResponse?.reajusted_payments_count > 0) {
      if (paymentResponse.contract) {
        setSchedule(Array.isArray(paymentResponse.contract.payment_schedule) ? paymentResponse.contract.payment_schedule : []);
        setLedgerEntries(Array.isArray(paymentResponse.contract.ledger_entries) ? paymentResponse.contract.ledger_entries : []);
      } else {
        loadContractData();
      }
    } else {
      // For regular payments, we might want to reload to get ledger entries and confirmed status
      loadContractData();
    }

    // Notify parent so list can refresh or patch (pass updated contract for optimistic UI)
    if (onPaymentSuccess) {
      const contractForList =
        updatedContract?.id != null
          ? { id: updatedContract.id, balance: updatedContract.balance, total_paid: updatedContract.total_paid, ...updatedContract }
          : paymentResponse?.payment?.contract;
      onPaymentSuccess(contractForList ?? paymentResponse);
    }
  }, [loadContractData, onPaymentSuccess]);
  // Stable callback for PaymentScheduleTab
  const handleTabPaymentSuccess = useCallback((resp) => handlePaymentResponse(resp, false), [handlePaymentResponse]);

  const handleUndoPayment = useCallback(async (paymentId) => {
    if (!paymentId) return;
    setUndoLoadingPaymentId(paymentId);
    try {
      await contractsApi.undoPayment(paymentId);
      await loadContractData();
      if (onPaymentSuccess) onPaymentSuccess({ payment: { id: paymentId }, type: "undo" });
      showToast(t("paymentSchedule.undoSuccess") || "Payment undone.", "success");
    } catch (error) {
      console.error("Error undoing payment:", error);
      showToast(error.message || t("paymentSchedule.undoError") || "Failed to undo payment.", "error");
    } finally {
      setUndoLoadingPaymentId(null);
    }
  }, [loadContractData, onPaymentSuccess, showToast, t]);

  const handleRequestUndoPayment = useCallback((paymentId) => {
    setUndoConfirmPaymentId(paymentId);
  }, []);

  const handleConfirmUndo = useCallback(async () => {
    if (!undoConfirmPaymentId) return;
    await handleUndoPayment(undoConfirmPaymentId);
    setUndoConfirmPaymentId(null);
  }, [undoConfirmPaymentId, handleUndoPayment]);

  useEffect(() => {
    if (!open || !contract?.id) {
      return;
    }
    loadContractData();
  }, [open, contract?.id, loadContractData]);

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
    const subtotal = safeSchedule.reduce((sum, payment) => {
      const amt = Number(payment.amount || 0);
      const paid = Number(payment.paid_amount || 0);
      const interest = Number(payment.interest_amount || 0);

      // Summarize paid amount (minus interest to get capital portion) if it differs from scheduled amount
      // This ensures overpayments and actual payments are reflected in the capital total
      if (paid > 0 && paid !== amt) {
        return sum + (paid - interest);
      }
      return sum + amt;
    }, 0);

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

  // Balance from ledger (sum of all ledger entry amounts) — single source of truth when ledger is loaded.
  const ledgerBalance = useMemo(() => {
    const entries = Array.isArray(ledgerEntries) ? ledgerEntries : [];
    return entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  }, [ledgerEntries]);

  const displayBalance =
    ledgerEntries.length > 0 ? ledgerBalance : (currentContract?.balance ?? 0);

  const translatePaymentType = useCallback((type) => {
    const normalizedType = type?.toLowerCase().replace(/\s+/g, '_');
    switch (normalizedType) {
      case "reservation": return t('payments.statusOptions.reservation');
      case "down_payment": return t('payments.statusOptions.down_payment');
      case "installment": return t('payments.statusOptions.installment');
      case "capital_repayment": return t('contracts.capitalPayment') || "Abono a Capital";
      default: return type || t('payments.statusOptions.installment');
    }
  }, [t]);

  if (!open) return null;

  if (!contract) {
    return null;
  }

  // Calculate paid amount and progress for the overview tab (use displayBalance so it matches ledger after undo)
  const paidAmount = currentContract?.total_paid ?? (
    Number(displayBalance) > 0
      ? (Number(summary?.price || 0) - Number(displayBalance))
      : (Number(summary?.price || 0) + Number(displayBalance)) // If balance is negative (refunds?), strictly this logic assumes positive balance
  );
  const progressPercent = Math.min(100, Math.max(0, (paidAmount / (summary?.price || 1)) * 100));

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
            <PaymentSummary
              summary={summary}
              paidAmount={paidAmount}
              displayBalance={displayBalance}
              progressPercent={progressPercent}
              activeMonths={activeMonths}
              currentContract={currentContract}
              currentUser={currentUser}
              t={t}
              fmt={fmt}
            />
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
              setApplyPaymentModal={setApplyPaymentModal}
              setEditingMora={setEditingMora}
              setMoratoryAmount={setMoratoryAmount}
              onPaymentSuccess={handleTabPaymentSuccess}
              onUndoPayment={handleRequestUndoPayment}
              undoLoadingPaymentId={undoLoadingPaymentId}
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
                setApplyPaymentModal(true);
              }}
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
      </div>

      {/* Apply Payment Modal */}
      <ApplyPaymentModal
        isOpen={applyPaymentModal}
        onClose={() => {
          setApplyPaymentModal(false);
          setSelectedPayment(null);
        }}
        selectedPayment={selectedPayment}
        contract={currentContract}
        onPaymentSuccess={handlePaymentResponse}
        schedule={schedule}
        setSchedule={setSchedule}
      />

      {/* Undo / Reversal confirmation modal */}
      <UndoConfirmationModal
        paymentId={undoConfirmPaymentId}
        onConfirm={handleConfirmUndo}
        onCancel={() => setUndoConfirmPaymentId(null)}
        isLoading={undoLoadingPaymentId === undoConfirmPaymentId}
      />

      {/* Edit Moratory Modal */}
      <EditMoratoryModal
        editingMora={editingMora}
        onClose={() => setEditingMora(null)}
        moratoryAmount={moratoryAmount}
        setMoratoryAmount={setMoratoryAmount}
        schedule={schedule}
        setSchedule={setSchedule}
      />

    </div>
  );
}

PaymentScheduleModal.propTypes = {
  contract: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onPaymentSuccess: PropTypes.func,
};

export default memo(PaymentScheduleModal);