import { useState } from "react";
import PropTypes from "prop-types";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import { formatStatus } from "../../utils/formatStatus";
import { useLocale } from "../../contexts/LocaleContext";
import { useToast } from "../../contexts/ToastContext";

/**
 * Version 2.0 PaymentItem - Highly refined with Liquid Animations and Glassmorphism
 */
function PaymentItem({ paymentInfo, index, userRole, refreshPayments, onClick, isMobileCard = false }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const token = getToken();

  // Modal State
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [editAmount, setEditAmount] = useState(paymentInfo.amount);
  const [editInterest, setEditInterest] = useState(paymentInfo.interest_amount || 0);
  const [approvalResult, setApprovalResult] = useState(null);

  const hasReceipt = Boolean(paymentInfo.document_url);

  const formatCurrency = (value, currency = "HNL") => {
    if (value === null || value === undefined) return "—";
    return `${currency} ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('common.notAvailable');
    try {
      return format(parseISO(dateString), "dd MMM, yyyy");
    } catch {
      return dateString;
    }
  };

  const maskIdentity = (identity) => {
    if (!identity) return "N/A";
    const str = String(identity);
    return str.length <= 8 ? str : `${str.slice(0, 4)}••••${str.slice(-4)}`;
  };

  const isOverdue = paymentInfo.due_date && !paymentInfo.payment_date
    ? isBefore(parseISO(paymentInfo.due_date), startOfDay(new Date()))
    : false;

  const totalAmount = Number(paymentInfo.amount || 0) + Number(paymentInfo.interest_amount || 0);
  const statusLower = (paymentInfo.status || "").toLowerCase();

  const getStatusConfig = () => {
    switch (statusLower) {
      case "paid":
        return {
          bg: "bg-blue-500/10",
          text: "text-blue-600 dark:text-blue-400",
          dot: "bg-blue-500",
          border: "border-blue-500/20"
        };
      case "submitted":
        return {
          bg: "bg-amber-500/10",
          text: "text-amber-600 dark:text-amber-400",
          dot: "bg-amber-500",
          border: "border-amber-500/20"
        };
      default:
        if (isOverdue) return { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", dot: "bg-rose-500", border: "border-rose-500/20" };
        return { bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400", border: "border-slate-500/20" };
    }
  };

  const statusConfig = getStatusConfig();
  const statusLabel = statusLower === "submitted"
    ? t('payments.statusOptions.submitted')
    : statusLower === "paid"
      ? t('payments.statusOptions.paid')
      : formatStatus(paymentInfo.status, t);

  const handleApprove = async () => {
    setApproveLoading(true);
    setApprovalResult(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/payments/${paymentInfo.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: editAmount, interest_amount: editInterest }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.errors?.join(" ") || t('payments.approveError'));
      }
      setApprovalResult({ type: 'success', message: t('payments.approveSuccess') });
      setTimeout(() => {
        if (typeof refreshPayments === "function") refreshPayments();
        setShowApproveModal(false);
        setApprovalResult(null);
      }, 1500);
    } catch (err) {
      setApprovalResult({ type: 'error', message: err.message });
    } finally {
      setApproveLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/payments/${paymentInfo.id}/download_receipt`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(t('payments.downloadReceiptError'));
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${paymentInfo.id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 15, stiffness: 100 } }
  };

  // --- VERSION 2.0 MOBILE VIEW ---
  if (isMobileCard) {
    return (
      <motion.div
        layout
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ y: -4, shadow: "0 10px 25px rgba(0,0,0,0.05)" }}
        className="relative group bg-white dark:bg-darkblack-600 rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden"
      >

        <div className="space-y-6 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
              {statusLabel}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t('payments.dueDate')}</span>
              <span className={`text-[11px] font-black ${isOverdue ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>{formatDate(paymentInfo.due_date)}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
              {paymentInfo.description} <span className="text-blue-500 font-normal">.</span>
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-[10px] font-black bg-slate-900 dark:bg-darkblack-400 text-white px-2.5 py-1 rounded-lg uppercase tracking-tighter">
                {paymentInfo.contract?.lot?.name || "N/A"}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-white/10" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{paymentInfo.contract?.applicant_user?.full_name || "-"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between pt-6 border-t border-slate-50 dark:border-white/5">
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Grand Total</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalAmount, paymentInfo.contract?.currency)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {statusLower === "submitted" && userRole === "admin" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); setShowApproveModal(true); }}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center"
                >
                  {t('payments.approve')}
                </motion.button>
              )}
              {statusLower === "paid" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); hasReceipt && handleDownloadReceipt(); }}
                  disabled={!hasReceipt}
                  className={`p-4 rounded-[22px] transition-all flex items-center justify-center ${hasReceipt ? "bg-white dark:bg-darkblack-500 text-blue-600 shadow-xl border border-slate-100 dark:border-white/5" : "bg-slate-50 text-slate-200 dark:bg-darkblack-500/50"}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {showApproveModal && <ApproveModal
          paymentInfo={paymentInfo} onClose={() => setShowApproveModal(false)}
          handleApprove={handleApprove} approveLoading={approveLoading} approvalResult={approvalResult}
          editAmount={editAmount} setEditAmount={setEditAmount} editInterest={editInterest} setEditInterest={setEditInterest}
          t={t} hasReceipt={hasReceipt} handleDownloadReceipt={handleDownloadReceipt}
        />}
      </motion.div>
    );
  }

  // --- VERSION 2.0 DESKTOP VIEW ---
  return (
    <motion.tr
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className="group border-b border-slate-100/50 dark:border-white/5 last:border-0 hover:bg-slate-50/40 dark:hover:bg-white/[0.02] transition-colors duration-400"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-5">
          <div className="relative w-10 h-10 rounded-xl bg-white dark:bg-darkblack-500 shadow-sm border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:border-blue-500/20 transition-all duration-500 overflow-hidden">
            <svg className="w-5 h-5 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5 truncate">{paymentInfo.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold tracking-wider text-blue-500 uppercase opacity-40">PROPERTY</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">{paymentInfo.contract?.lot?.name || "-"}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{paymentInfo.contract?.applicant_user?.full_name || "-"}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 opacity-60 mt-0.5">{maskIdentity(paymentInfo.contract?.applicant_user?.identity)}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <span className={`text-xl font-bold ${isOverdue ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
              {formatCurrency(totalAmount, paymentInfo.contract?.currency)}
            </span>
          </div>
          {paymentInfo.interest_amount > 0 && <span className="text-[9px] font-bold text-rose-500 uppercase mt-0.5">+{formatCurrency(paymentInfo.interest_amount)} ACCRUED</span>}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className={`text-[13px] font-bold ${isOverdue ? "text-rose-600" : "text-slate-900 dark:text-slate-300"}`}>{formatDate(paymentInfo.due_date)}</span>
          {isOverdue && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider mt-1">PAST DUE</span>}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} shadow-sm shadow-black/5`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${statusConfig.dot} animate-pulse`} />
          {statusLabel}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-500 ease-out">
          {statusLower === "submitted" && userRole === "admin" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); setShowApproveModal(true); }}
              className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 transition-all"
            >
              {t('payments.approve')}
            </motion.button>
          )}
          {statusLower === "paid" && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); hasReceipt && handleDownloadReceipt(); }}
              disabled={!hasReceipt}
              className={`p-3 rounded-2xl transition-all ${hasReceipt ? "bg-white dark:bg-darkblack-500 text-blue-600 shadow-lg border border-slate-100 dark:border-white/10" : "text-slate-200 cursor-not-allowed"}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </motion.button>
          )}
        </div>
      </td>

      <AnimatePresence>
        {showApproveModal && (
          <ApproveModal
            key="approve-modal"
            paymentInfo={paymentInfo} onClose={() => setShowApproveModal(false)}
            handleApprove={handleApprove} approveLoading={approveLoading} approvalResult={approvalResult}
            editAmount={editAmount} setEditAmount={setEditAmount} editInterest={editInterest} setEditInterest={setEditInterest}
            t={t} hasReceipt={hasReceipt} handleDownloadReceipt={handleDownloadReceipt}
          />
        )}
      </AnimatePresence>
    </motion.tr>
  );
}

/**
 * Version 2.0 Approve Modal - Ultra Premium
 */
function ApproveModal({
  paymentInfo, onClose, handleApprove, approveLoading, approvalResult,
  editAmount, setEditAmount, editInterest, setEditInterest, t, hasReceipt, handleDownloadReceipt
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-[12px] flex items-center justify-center z-[100] p-6 lg:ml-[280px]" onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        className="bg-white dark:bg-darkblack-600 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 dark:border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Left Side: Receipt Preview */}
          <div className="lg:w-1/2 p-2 hidden lg:block">
            {hasReceipt ? (
              <div className="h-full w-full rounded-[40px] overflow-hidden bg-slate-50 dark:bg-darkblack-500 relative group">
                {paymentInfo.document_url.toLowerCase().endsWith('.pdf') ? (
                  <iframe src={paymentInfo.document_url} title="PDF" className="w-full h-full border-0" />
                ) : (
                  <img src={paymentInfo.document_url} alt="Receipt" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-slate-900/20 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={handleDownloadReceipt}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider shadow-lg hover:bg-slate-50 transition-all"
                >
                  Download Receipt
                </button>
              </div>
            ) : (
              <div className="h-full w-full rounded-[40px] border-4 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-slate-300 space-y-4">
                <svg className="w-16 h-16 opacity-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span className="text-xs font-black uppercase tracking-[0.3em] opacity-30 italic">No artifact uploaded</span>
              </div>
            )}
          </div>

          {/* Right Side: Controls */}
          <div className="flex-1 p-10 lg:p-14 flex flex-col justify-between">
            <div className="space-y-12">
              <div className="flex justify-between items-start">
                <div>
                  <div className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-4">
                    Payment Verification
                  </div>
                  <h3 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Approve <span className="text-emerald-500 font-normal">.</span>
                  </h3>
                  <p className="text-slate-400 font-medium mt-2 uppercase text-[10px] tracking-wider max-w-[300px]">{paymentInfo.description}</p>
                </div>
                <button onClick={onClose} className="p-4 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm">
                  <svg className="w-6 h-6 border-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('payments.amount')}</label>
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg pr-2 border-r border-gray-100 dark:border-white/10 uppercase">{paymentInfo.contract?.currency}</span>
                    <input
                      type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)}
                      className="w-full pl-24 pr-10 py-5 bg-slate-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 focus:border-emerald-500 rounded-2xl outline-none font-bold text-2xl dark:text-white transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-4">{t('payments.lateInterest')}</label>
                  <div className="relative group">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300/50 font-black italic text-xl pr-2 border-r border-white/10">{paymentInfo.contract?.currency}</span>
                    <input
                      type="number" value={editInterest} onChange={e => setEditInterest(e.target.value)}
                      className="w-full pl-28 pr-12 py-7 bg-slate-50 dark:bg-white/[0.03] border-4 border-transparent focus:border-emerald-500/30 rounded-[32px] outline-none font-black text-3xl dark:text-white transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-8">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 pr-1">Total Receivable Value</span>
                <div className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  {(Number(editAmount) + Number(editInterest)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  <span className="text-lg font-medium ml-2 opacity-30 uppercase tracking-widest">{paymentInfo.contract?.currency}</span>
                </div>
              </div>

              <AnimatePresence>
                {approvalResult && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-5 rounded-2xl text-center text-[10px] font-bold uppercase tracking-wider shadow-sm ${approvalResult.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {approvalResult.message}
                  </motion.div>
                )}
              </AnimatePresence>

              {!approvalResult?.type && (
                <motion.button
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                  onClick={handleApprove} disabled={approveLoading}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                >
                  {approveLoading ? (
                    <span className="animate-spin block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <>
                      Authorize Transaction
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

PaymentItem.propTypes = {
  paymentInfo: PropTypes.object.isRequired,
  index: PropTypes.number,
  userRole: PropTypes.string,
  refreshPayments: PropTypes.func,
  onClick: PropTypes.func,
  isMobileCard: PropTypes.bool
};

export default PaymentItem;
