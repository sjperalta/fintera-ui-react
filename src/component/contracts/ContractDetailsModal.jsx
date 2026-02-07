// src/component/contracts/ContractDetailsModal.jsx
import { createPortal } from "react-dom";
import { useState, useContext, useEffect, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faMapMarkerAlt,
  faUser,
  faCreditCard,
  faCalendarAlt,
  faInfoCircle,
  faExclamationTriangle,
  faTimes,
  faEdit,
  faSave,
  faWindowClose,
  faIdCard,
  faPhone,
  faTag,
  faChartLine,
  faDollarSign,
  faCalculator,
  faStickyNote,
  faCheckCircle,
  faLock,
  faBan,
  faClock,
  faClipboardList,
  faFilePdf,
  faFileAlt,
  faFileSignature,
  faTrashAlt
} from "@fortawesome/free-solid-svg-icons";
import { formatStatus } from "../../utils/formatStatus";
import { useLocale } from "../../contexts/LocaleContext";
import { useToast } from "../../contexts/ToastContext";
import { API_URL } from "../../../config";
import AuthContext from "../../contexts/AuthContext";

const formatCurrency = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  const num = Number(v);
  if (isNaN(num)) return v;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(num).replace('$', '') + " HNL";
};

// Color mapping for status
const getStatusTheme = (status) => {
  const s = status?.toLowerCase();
  switch (s) {
    case "pending":
      return {
        bg: "bg-yellow-50 dark:bg-yellow-900/10",
        text: "text-yellow-700 dark:text-yellow-400",
        border: "border-yellow-300 dark:border-yellow-500/40",
        icon: faClock,
        color: "#EAB308",
        shadow: "shadow-yellow-500/10"
      };
    case "submitted":
      return {
        bg: "bg-blue-50 dark:bg-blue-900/10",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-300 dark:border-blue-500/40",
        icon: faClipboardList,
        color: "#3B82F6",
        shadow: "shadow-blue-500/10"
      };
    case "approved":
      return {
        bg: "bg-green-50 dark:bg-green-900/10",
        text: "text-green-700 dark:text-green-400",
        border: "border-green-300 dark:border-green-500/40",
        icon: faCheckCircle,
        color: "#22C55E",
        shadow: "shadow-green-500/10"
      };
    case "rejected":
      return {
        bg: "bg-red-50 dark:bg-red-900/10",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-300 dark:border-red-500/40",
        icon: faExclamationTriangle,
        color: "#EF4444",
        shadow: "shadow-red-500/10"
      };
    case "closed":
      return {
        bg: "bg-blue-50 dark:bg-blue-900/10",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-300 dark:border-blue-500/40",
        icon: faLock,
        color: "#3B82F6",
        shadow: "shadow-blue-500/10"
      };
    case "canceled":
    case "cancelled":
      return {
        bg: "bg-gray-100 dark:bg-gray-800",
        text: "text-gray-500 dark:text-gray-400",
        border: "border-gray-400 dark:border-gray-600",
        icon: faBan,
        color: "#9CA3AF"
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-900/10",
        text: "text-gray-700 dark:text-gray-400",
        border: "border-gray-300 dark:border-gray-800/30",
        icon: faInfoCircle,
        color: "#6B7280"
      };
  }
};

// Contract Details Modal Component
const ContractDetailsModal = memo(function ContractDetailsModal({
  isOpen,
  onClose,
  contract,
  onContractUpdate,
  onContractDeleted,
}) {
  const { t } = useLocale();
  const { user, token } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  // Editable fields
  const [paymentTerm, setPaymentTerm] = useState(contract?.payment_term ?? "");
  const [reserveAmount, setReserveAmount] = useState(
    contract?.reserve_amount ?? ""
  );
  const [downPayment, setDownPayment] = useState(contract?.down_payment ?? "");
  const [maxPaymentDate, setMaxPaymentDate] = useState(
    contract?.max_payment_date ? String(contract.max_payment_date).slice(0, 10) : ""
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [fullContract, setFullContract] = useState(null);
  const [isLoadingFull, setIsLoadingFull] = useState(false);

  const statusTheme = useMemo(() => getStatusTheme(contract?.status), [contract?.status]);

  // Edit schedule, reserve and pago inicial only when status is pending, rejected or submitted
  const canEditSchedule = useMemo(() => {
    const s = contract?.status?.toLowerCase();
    return s === "pending" || s === "rejected" || s === "submitted";
  }, [contract?.status]);

  // Sync local state from contract only when contract prop changes (e.g. open modal, or parent passed updated contract). Do not depend on full contract or typing will reset the inputs on every parent re-render.
  useEffect(() => {
    if (contract) {
      setPaymentTerm(contract.payment_term ?? "");
      setReserveAmount(contract.reserve_amount ?? "");
      setDownPayment(contract.down_payment ?? "");
      setMaxPaymentDate(contract.max_payment_date ? String(contract.max_payment_date).slice(0, 10) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only sync when these fields change to avoid resetting form while user types
  }, [contract?.id, contract?.payment_term, contract?.reserve_amount, contract?.down_payment, contract?.max_payment_date]);

  // Fetch full contract details (including payment schedule)
  useEffect(() => {
    const fetchFullContract = async () => {
      if (!contract?.id || !token) return;

      setIsLoadingFull(true);
      try {
        const response = await fetch(
          `${API_URL}/api/v1/projects/${contract.project_id}/lots/${contract.lot_id}/contracts/${contract.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setFullContract(data.contract || null);
        }
      } catch (error) {
        console.error("Error fetching full contract details:", error);
      } finally {
        setIsLoadingFull(false);
      }
    };

    if (isOpen) {
      fetchFullContract();
    } else {
      setFullContract(null);
    }
  }, [isOpen, contract?.id, contract?.project_id, contract?.lot_id, token]);

  if (!isOpen || !contract) return null;

  const displayContract = fullContract || contract;
  // Calculate paid amount and progress for the overview tab
  const paidAmount = displayContract?.total_paid ?? (Number(displayContract?.amount || 0) - Number(displayContract?.balance || 0));
  const progressPercent = Math.min(100, Math.max(0, (paidAmount / (Number(displayContract?.amount) || 1)) * 100));

  // Calculate monthly payment with current values
  const calculateCurrentMonthlyPayment = () => {
    // If we have full contract details, check the payment schedule for the first installment
    if (fullContract?.payment_schedule && fullContract.payment_schedule.length > 0) {
      const installments = fullContract.payment_schedule.filter(p => p.type?.toLowerCase() === 'installment');
      if (installments.length > 0) {
        // Return first installment amount + interest_amount
        const first = installments[0];
        const totalAmount = Number(first.amount || 0) + Number(first.interest_amount || 0);
        return formatCurrency(totalAmount);
      }
    }

    // Fallback to manual calculation if no schedule is available
    const amount = Number(contract.amount);
    const term = Number(paymentTerm || 0);
    const down = Number(downPayment || 0);
    const reserve = Number(reserveAmount || 0);

    if (!amount || !term || term <= 0) return "N/A";

    const principal =
      contract.financing_type?.toLowerCase() === "cash"
        ? amount
        : amount - down - reserve;

    if (principal <= 0) return "N/A";

    const monthlyPayment = principal / term;
    return formatCurrency(monthlyPayment);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${contract.project_id}/lots/${contract.lot_id}/contracts/${contract.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            payment_term: Number(paymentTerm),
            reserve_amount: Number(reserveAmount),
            down_payment: Number(downPayment),
            ...((displayContract?.financing_type?.toLowerCase() === "bank" || displayContract?.financing_type?.toLowerCase() === "cash") && maxPaymentDate
              ? { max_payment_date: maxPaymentDate }
              : {}),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
          errorData.errors?.join(", ") ||
          t("contractDetailsModal.errorSaving")
        );
      }

      const result = await response.json();
      showToast(
        result.message || t("contractDetailsModal.savedSuccessfully"),
        "success"
      );
      setIsEditMode(false);

      // Refresh full contract in modal so displayed values (e.g. monthly payment) stay in sync
      if (result.contract) {
        setFullContract((prev) => (prev ? { ...prev, ...result.contract } : result.contract));
      }

      // Notify parent component of update
      if (onContractUpdate) {
        onContractUpdate(result.contract);
      }
    } catch (error) {
      console.error("Error saving contract:", error);
      showToast(error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContract = async () => {
    if (!contract?.id || !token) return;
    if (!window.confirm(t("contractDetailsModal.deleteConfirm"))) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${contract.project_id}/lots/${contract.lot_id}/contracts/${contract.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || t("contractDetailsModal.errorDeleting"));
      }
      showToast(data.message || t("contractDetailsModal.deletedSuccess"), "success");
      onContractDeleted?.();
      onClose();
    } catch (error) {
      console.error("Error deleting contract:", error);
      showToast(error.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadCustomerRecord = async () => {
    try {
      showToast(t("common.processing"), "info");
      const response = await fetch(
        `${API_URL}/api/v1/reports/customer_record_pdf?contract_id=${contract.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(t("contracts.errorDownloadingRecord"));
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      console.log(response);

      a.href = url;
      a.download = `ficha_cliente_${contract.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(t("common.downloadSuccess"), "success");
    } catch (error) {
      console.error("Error downloading customer record:", error);
      showToast(t("contracts.errorDownloadingRecord"), "error");
    }
  };

  const handleDownloadDocument = async (document_name, document_label) => {
    try {
      showToast(t("common.processing"), "info");
      let endpoint = `${API_URL}/api/v1/reports/${document_name}?contract_id=${contract.id}`;

      if (contract.financing_type && document_name === 'user_promise_contract_pdf') {
        endpoint += `&financing_type=${contract.financing_type}`;
      }

      if (contract.applicant_user_id) {
        endpoint += `&user_id=${contract.applicant_user_id}`;
      }

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error downloading ${document_label}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${document_name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(`${document_label} descargado exitosamente.`, "success");
    } catch (error) {
      console.error(`Error downloading ${document_label}:`, error);
      showToast(`Error: ${error.message}`, "error");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Animated Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-bgray-900/60 dark:bg-black/80 backdrop-blur-md"
      />

      {/* Main Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-6xl h-full sm:h-[90vh] bg-white dark:bg-darkblack-600 sm:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/20"
      >
        {/* Sidebar - Mobile Top / Desktop Left */}
        <div className="w-full md:w-80 flex-shrink-0 bg-gray-50/50 dark:bg-darkblack-500/50 backdrop-blur-sm border-b md:border-b-0 md:border-r border-gray-100 dark:border-darkblack-400 flex flex-col">
          {/* Sidebar Header with Status */}
          <div className={`p-8 ${statusTheme.bg} transition-colors duration-500`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${statusTheme.shadow}`} style={{ backgroundColor: statusTheme.color }}>
                <FontAwesomeIcon icon={statusTheme.icon} className="text-2xl" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60 dark:opacity-40">{t("common.status")}</p>
                <p className={`text-lg font-black ${statusTheme.text} capitalize`}>{formatStatus(contract.status, t)}</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-bgray-900 dark:text-white leading-tight">
                {contract.contract_id || "#N/A"}
              </h3>
              <p className="text-sm font-medium text-bgray-500 dark:text-bgray-400">
                {t("contracts.created")} {new Date(contract.created_at).toLocaleDateString()}
              </p>
              {(displayContract?.created_by) && (
                <p className="text-sm font-medium text-bgray-500 dark:text-bgray-400 mt-1 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="text-bgray-400" />
                  {t("contractDetailsModal.reservedBy") || t("lotsTable.reservedBy")}: <span className="font-semibold text-bgray-700 dark:text-bgray-300">{displayContract.created_by}</span>
                </p>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
            {[
              { id: 'overview', label: t('common.overview') || 'Resumen', icon: faChartLine },
              { id: 'financial', label: t('contracts.financial') || 'Financiero', icon: faDollarSign },
              { id: 'lot_project', label: t('contracts.lotAndProject') || 'Lote y Proyecto', icon: faBuilding },
              { id: 'applicant', label: t('contracts.applicant') || 'Solicitante', icon: faUser },
              { id: 'notes', label: t('contracts.notes') || 'Notas', icon: faStickyNote, show: !!contract.note },
              { id: 'documents', label: t('contracts.documents') || 'Documentos', icon: faFileAlt },
            ].map((tab) => (tab.show !== false && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 translate-x-1"
                  : "text-bgray-500 dark:text-bgray-400 hover:bg-white dark:hover:bg-darkblack-400 hover:text-blue-500"
                  }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${activeTab === tab.id ? "bg-white/20" : "bg-gray-100 dark:bg-darkblack-400 group-hover:scale-110"
                  }`}>
                  <FontAwesomeIcon icon={tab.icon} />
                </div>
                {tab.label}
              </button>
            )))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-darkblack-400 space-y-3">
            {isAdmin && contract?.status?.toLowerCase() === "rejected" && (
              <button
                type="button"
                onClick={handleDeleteContract}
                disabled={isDeleting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faTrashAlt} />
                )}
                {t("contractDetailsModal.deleteContract")}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gray-100 dark:bg-darkblack-400 text-bgray-600 dark:text-bgray-300 font-black hover:bg-gray-200 dark:hover:bg-darkblack-300 transition-all duration-300"
            >
              <FontAwesomeIcon icon={faWindowClose} />
              {t("common.close")}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-darkblack-600 relative">
          {/* Top Bar - Content Controls */}
          <div className="h-20 flex-shrink-0 flex items-center justify-between px-10 border-b border-gray-50 dark:border-darkblack-500">
            <h4 className="text-2xl font-black text-bgray-900 dark:text-white capitalize">
              {activeTab.replace('_', ' & ')}
            </h4>
            <div className="flex items-center gap-3">
              {isAdmin && activeTab === 'financial' && canEditSchedule && (
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${isEditMode
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                    : "bg-gray-50 dark:bg-darkblack-500 text-bgray-600 dark:text-bgray-300 hover:bg-amber-50 hover:text-amber-600"
                    }`}
                >
                  <FontAwesomeIcon icon={isEditMode ? faTimes : faEdit} />
                  {isEditMode ? t("common.cancel") : t("common.edit")}
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Status Summary Card */}
                    <div className={`p-8 rounded-[2rem] border-2 ${statusTheme.border} ${statusTheme.bg} transition-all duration-500`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                          <h5 className={`text-sm font-black uppercase tracking-widest ${statusTheme.text} mb-2 opacity-70`}>{t("contracts.statusSummary") || "Resumen de Estado"}</h5>
                          <p className="text-3xl font-black text-bgray-900 dark:text-white leading-tight max-w-xl">
                            {contract.status?.toLowerCase() === 'approved'
                              ? (t("contracts.approvedWelcome") || "El contrato ha sido aprobado y está activo.")
                              : contract.status?.toLowerCase() === 'rejected'
                                ? (t("contracts.rejectedNotice") || "Este contrato ha sido rechazado.")
                                : (t("contracts.pendingReview") || "El contrato está esperando revisión administrativa.")}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className={`px-6 py-3 rounded-2xl bg-white dark:bg-darkblack-500 shadow-xl border ${statusTheme.border} flex items-center gap-3`}>
                            <FontAwesomeIcon icon={statusTheme.icon} className={statusTheme.text} />
                            <span className={`text-lg font-black ${statusTheme.text}`}>{formatStatus(contract.status, t)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50/50 dark:bg-darkblack-500/50 p-6 rounded-3xl border border-gray-100 dark:border-darkblack-400">
                        <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-2">{t("contracts.total") || "Total Deuda"}</p>
                        <p className="text-2xl font-black text-bgray-900 dark:text-white">{formatCurrency(contract.amount)}</p>
                      </div>
                      <div className="bg-gray-50/50 dark:bg-darkblack-500/50 p-6 rounded-3xl border border-gray-100 dark:border-darkblack-400">
                        <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-2">{t("contracts.balance") || "Saldo Pendiente"}</p>
                        <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{formatCurrency(contract.balance)}</p>
                      </div>
                      <div className="bg-gray-50/50 dark:bg-darkblack-500/50 p-6 rounded-3xl border border-gray-100 dark:border-darkblack-400">
                        <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-2">{t("contracts.progress") || "Progreso"}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-gray-200 dark:bg-darkblack-400 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${progressPercent}%`
                              }}
                              className="h-full bg-blue-600 rounded-full"
                            />
                          </div>
                          <p className="text-sm font-black text-bgray-900 dark:text-white">
                            {formatCurrency(paidAmount)} / {formatCurrency(displayContract.amount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline / Additional Info Placeholder */}
                    {contract.rejection_reason && (
                      <div className="p-8 bg-red-50/50 dark:bg-red-900/10 rounded-[2rem] border-2 border-red-100 dark:border-red-900/20">
                        <h5 className="text-sm font-black uppercase tracking-widest text-red-600 mb-4">{t("contracts.rejectionReason") || "Motivo de Rechazo"}</h5>
                        <p className="text-lg font-medium text-red-800 dark:text-red-300 leading-relaxed italic">
                          "{contract.rejection_reason}"
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'lot_project' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Project Card */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                          <FontAwesomeIcon icon={faBuilding} className="text-xl" />
                        </div>
                        <h5 className="text-xl font-black text-bgray-900 dark:text-white">{t("contractDetailsModal.project")}</h5>
                      </div>

                      <div className="bg-white dark:bg-darkblack-500 rounded-3xl border border-gray-100 dark:border-darkblack-400 shadow-sm p-8 space-y-6">
                        <div>
                          <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.name")}</p>
                          <p className="text-lg font-black text-bgray-900 dark:text-white">{contract.project_name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.address")}</p>
                          <div className="flex items-start gap-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-bgray-400 mt-1" />
                            <p className="text-base font-medium text-bgray-600 dark:text-bgray-300 leading-relaxed">{contract.project_address || "N/A"}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.id")}</p>
                          <p className="text-sm font-mono font-bold text-bgray-500">{contract.project_id || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Lot Card */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                          <FontAwesomeIcon icon={faTag} className="text-xl" />
                        </div>
                        <h5 className="text-xl font-black text-bgray-900 dark:text-white">{t("contractDetailsModal.lot")}</h5>
                      </div>

                      <div className="bg-white dark:bg-darkblack-500 rounded-3xl border border-gray-100 dark:border-darkblack-400 shadow-sm p-8 space-y-6">
                        <div>
                          <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.name")}</p>
                          <p className="text-lg font-black text-bgray-900 dark:text-white">{contract.lot_name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.address")}</p>
                          <div className="flex items-start gap-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-bgray-400 mt-1" />
                            <p className="text-base font-medium text-bgray-600 dark:text-bgray-300 leading-relaxed">{contract.lot_address || "N/A"}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.id")}</p>
                          <p className="text-sm font-mono font-bold text-bgray-500">{contract.lot_id || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'financial' && (
                  <div className="space-y-10">
                    {/* Financial Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                          <FontAwesomeIcon icon={faCalculator} className="text-xl" />
                        </div>
                        <div>
                          <h5 className="text-xl font-black text-bgray-900 dark:text-white">{t("contractDetailsModal.financialInfo")}</h5>
                          <p className="text-sm font-medium text-bgray-500">{t("contracts.paymentSummary") || "Resumen de pagos y financiamiento"}</p>
                        </div>
                      </div>
                      {isEditMode && (
                        <button
                          onClick={handleSaveChanges}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                        >
                          {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <FontAwesomeIcon icon={faSave} />
                          )}
                          {isSaving ? t("common.saving") : t("common.save")}
                        </button>
                      )}
                    </div>

                    {/* Main Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">{t("contractDetailsModal.totalPrice")}</p>
                        <p className="text-2xl font-black text-bgray-900 dark:text-white">{formatCurrency(contract.amount)}</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-gray-50 dark:bg-darkblack-500/50 border border-gray-100 dark:border-darkblack-400">
                        <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-2">{t("contractDetailsModal.financingType")}</p>
                        <p className="text-lg font-black text-bgray-900 dark:text-white capitalize">{t(`contractDetailsModal.financingTypes.${contract.financing_type?.toLowerCase()}`) || "N/A"}</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-gray-50 dark:bg-darkblack-500/50 border border-gray-100 dark:border-darkblack-400">
                        <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-2">{t("contractDetailsModal.financedAmount")}</p>
                        <p className="text-xl font-black text-bgray-900 dark:text-white">
                          {formatCurrency(Number(contract.amount) - Number(reserveAmount || 0) - (contract.financing_type?.toLowerCase() === "direct" ? Number(downPayment || 0) : 0))}
                        </p>
                      </div>
                      {(contract.financing_type?.toLowerCase() === "bank" || contract.financing_type?.toLowerCase() === "cash") && (displayContract?.max_payment_date || maxPaymentDate) && (
                        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">{t("contractDetailsModal.balanceDueBy")}</p>
                          <p className="text-xl font-black text-amber-700 dark:text-amber-400">
                            {new Date((displayContract?.max_payment_date || maxPaymentDate)).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                      )}
                      {contract.financing_type?.toLowerCase() === "direct" && (
                        <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">{t("contractDetailsModal.monthlyPayment")}</p>
                          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                            {isLoadingFull ? (
                              <span className="animate-pulse">...</span>
                            ) : (
                              calculateCurrentMonthlyPayment()
                            )}
                          </p>
                        </div>
                      )}
                    </div>

                    {isEditMode && (
                      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          {t("contractDetailsModal.scheduleEditWarning")}
                        </p>
                      </div>
                    )}

                    {/* Editable Fields Grid */}
                    <div className="bg-white dark:bg-darkblack-500 rounded-[2.5rem] border border-gray-100 dark:border-darkblack-400 shadow-sm p-10">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Payment Term */}
                        <div className="space-y-3">
                          <label className="text-sm font-black text-bgray-900 dark:text-white block uppercase tracking-wider">{t("contractDetailsModal.paymentTerm")}</label>
                          <div className="relative group">
                            <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-5 top-1/2 -translate-y-1/2 text-bgray-400 group-focus-within:text-blue-500 transition-colors" />
                            {isEditMode ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={paymentTerm}
                                  onChange={(e) => setPaymentTerm(e.target.value)}
                                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-darkblack-400 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-darkblack-600 outline-none transition-all font-bold text-bgray-900 dark:text-white"
                                  min="1"
                                />
                                <span className="text-sm font-bold text-bgray-400">{t("contractDetailsModal.months")}</span>
                              </div>
                            ) : (
                              <p className="pl-12 py-4 text-bgray-600 dark:text-bgray-300 font-bold">{paymentTerm || "—"} {t("contractDetailsModal.months")}</p>
                            )}
                          </div>
                        </div>

                        {/* Reserve Amount */}
                        <div className="space-y-3">
                          <label className="text-sm font-black text-bgray-900 dark:text-white block uppercase tracking-wider">{t("contractDetailsModal.reserveAmount")}</label>
                          <div className="relative group">
                            <FontAwesomeIcon icon={faDollarSign} className="absolute left-5 top-1/2 -translate-y-1/2 text-bgray-400 group-focus-within:text-blue-500 transition-colors" />
                            {isEditMode ? (
                              <input
                                type="number"
                                value={reserveAmount}
                                onChange={(e) => setReserveAmount(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-darkblack-400 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-darkblack-600 outline-none transition-all font-bold text-bgray-900 dark:text-white"
                                step="0.01"
                              />
                            ) : (
                              <p className="pl-12 py-4 text-bgray-600 dark:text-bgray-300 font-bold">{formatCurrency(reserveAmount)}</p>
                            )}
                          </div>
                        </div>

                        {/* Down Payment */}
                        <div className="space-y-3">
                          <label className="text-sm font-black text-bgray-900 dark:text-white block uppercase tracking-wider">{t("contractDetailsModal.downPayment")}</label>
                          <div className="relative group">
                            <FontAwesomeIcon icon={faCreditCard} className="absolute left-5 top-1/2 -translate-y-1/2 text-bgray-400 group-focus-within:text-blue-500 transition-colors" />
                            {isEditMode ? (
                              <input
                                type="number"
                                value={downPayment}
                                onChange={(e) => setDownPayment(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-darkblack-400 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-darkblack-600 outline-none transition-all font-bold text-bgray-900 dark:text-white"
                                step="0.01"
                              />
                            ) : (
                              <p className="pl-12 py-4 text-bgray-600 dark:text-bgray-300 font-bold">{formatCurrency(downPayment)}</p>
                            )}
                          </div>
                        </div>

                        {/* Max payment date (bank or cash) */}
                        {(displayContract?.financing_type?.toLowerCase() === "bank" || displayContract?.financing_type?.toLowerCase() === "cash") && (
                          <div className="space-y-3">
                            <label className="text-sm font-black text-bgray-900 dark:text-white block uppercase tracking-wider">{t("contractDetailsModal.maxPaymentDate")}</label>
                            <div className="relative group">
                              <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-5 top-1/2 -translate-y-1/2 text-bgray-400 group-focus-within:text-blue-500 transition-colors" />
                              {isEditMode ? (
                                <input
                                  type="date"
                                  value={maxPaymentDate}
                                  onChange={(e) => setMaxPaymentDate(e.target.value)}
                                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-darkblack-400 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-darkblack-600 outline-none transition-all font-bold text-bgray-900 dark:text-white"
                                />
                              ) : (
                                <p className="pl-12 py-4 text-bgray-600 dark:text-bgray-300 font-bold">
                                  {maxPaymentDate ? new Date(maxPaymentDate).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "—"}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'applicant' && (
                  <div className="space-y-10">
                    {/* Applicant Header */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                        <FontAwesomeIcon icon={faUser} className="text-xl" />
                      </div>
                      <div>
                        <h5 className="text-xl font-black text-bgray-900 dark:text-white">{t("contractDetailsModal.applicant")}</h5>
                        <p className="text-sm font-medium text-bgray-500">{t("contracts.clientDetails") || "Información del cliente y perfil crediticio"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* Details Card */}
                      <div className="bg-white dark:bg-darkblack-500 rounded-3xl border border-gray-100 dark:border-darkblack-400 shadow-sm p-8 space-y-8">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-3xl font-black text-indigo-600">
                            {contract.applicant_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-1">{t("contractDetailsModal.name")}</p>
                            <p className="text-xl font-black text-bgray-900 dark:text-white">{contract.applicant_name || "N/A"}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-50 dark:border-darkblack-400">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <FontAwesomeIcon icon={faIdCard} className="text-bgray-400 text-xs" />
                              <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest">{t("contractDetailsModal.identity")}</p>
                            </div>
                            <p className="text-base font-bold text-bgray-900 dark:text-white font-mono">{contract.applicant_identity || "N/A"}</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <FontAwesomeIcon icon={faPhone} className="text-bgray-400 text-xs" />
                              <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest">{t("contractDetailsModal.phone")}</p>
                            </div>
                            <p className="text-base font-bold text-bgray-900 dark:text-white">{contract.applicant_phone || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Credit Score Visualization (FICO 300–850) - Only visible for Admin */}
                      {isAdmin && contract.applicant_credit_score !== undefined && (() => {
                        const ficoMin = 300, ficoMax = 850, circumference = 283;
                        const score = Math.round(Math.max(ficoMin, Math.min(ficoMax, contract.applicant_credit_score)));
                        const fillLength = ((score - ficoMin) / (ficoMax - ficoMin)) * circumference;
                        const isExcellent = score >= 750;
                        const isGood = score >= 670 && score < 750;
                        return (
                          <div className="bg-white dark:bg-darkblack-500 rounded-3xl border border-gray-100 dark:border-darkblack-400 shadow-sm p-8 flex flex-col items-center justify-center text-center">
                            <p className="text-xs font-bold text-bgray-400 uppercase tracking-widest mb-6">{t("contractDetailsModal.creditScore")}</p>

                            <div className="relative w-40 h-40 mb-6">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="10" fill="none" className="text-gray-100 dark:text-darkblack-400" />
                                <motion.circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  stroke="currentColor"
                                  strokeWidth="10"
                                  fill="none"
                                  strokeLinecap="round"
                                  initial={{ strokeDasharray: "0 283" }}
                                  animate={{ strokeDasharray: `${fillLength} 283` }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                  className={`${isExcellent ? "text-emerald-500" : isGood ? "text-amber-500" : "text-red-500"}`}
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-bgray-900 dark:text-white">{score}</span>
                                <span className="text-xs font-bold text-bgray-400">/ {ficoMax}</span>
                              </div>
                            </div>

                            <div className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest ${isExcellent ? "bg-emerald-50 text-emerald-600" : isGood ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                              {isExcellent ? t("creditScore.excellent") : isGood ? t("creditScore.good") : t("creditScore.needsImprovement")}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-darkblack-900/30 flex items-center justify-center text-gray-600">
                        <FontAwesomeIcon icon={faStickyNote} className="text-xl" />
                      </div>
                      <div>
                        <h5 className="text-xl font-black text-bgray-900 dark:text-white">{t("contracts.notes")}</h5>
                        <p className="text-sm font-medium text-bgray-500">{t("contracts.internalNotes") || "Notas internas y comentarios del contrato"}</p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-darkblack-500 rounded-[2.5rem] border border-gray-100 dark:border-darkblack-400 shadow-sm p-10 min-h-[300px]">
                      {contract.note ? (
                        <div
                          className="text-lg text-bgray-600 dark:text-bgray-300 leading-relaxed prose prose-lg dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: contract.note }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-bgray-400 space-y-4">
                          <FontAwesomeIcon icon={faStickyNote} className="text-5xl opacity-20" />
                          <p className="font-bold">{t("contracts.noNotes") || "No hay notas disponibles para este contrato."}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <FontAwesomeIcon icon={faFileAlt} className="text-xl" />
                      </div>
                      <div>
                        <h5 className="text-xl font-black text-bgray-900 dark:text-white">{t("contracts.documents")}</h5>
                        <p className="text-sm font-medium text-bgray-500">{t("contracts.availableDocuments") || "Documentos disponibles para descarga"}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Ficha de Cliente */}
                      <button
                        onClick={handleDownloadCustomerRecord}
                        className="w-full p-5 rounded-2xl bg-white dark:bg-darkblack-500 border border-bgray-100 dark:border-transparent hover:border-blue-500 dark:hover:border-blue-500/40 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FontAwesomeIcon icon={faFilePdf} className="text-2xl text-rose-500" />
                          </div>
                          <div className="text-left">
                            <p className="text-base font-bold text-bgray-900 dark:text-white">Ficha de Cliente</p>
                            <p className="text-xs font-medium text-bgray-400 dark:text-bgray-500">{t("contracts.customerRecord") || "Información del cliente"}</p>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                      </button>

                      {/* Promesa de Compra Venta */}
                      {["direct", "cash", "bank"].includes(contract.financing_type?.toLowerCase()) && (
                        <button
                          onClick={() => handleDownloadDocument('user_promise_contract_pdf', 'Promesa de Compra Venta')}
                          className="w-full p-5 rounded-2xl bg-white dark:bg-darkblack-500 border border-bgray-100 dark:border-transparent hover:border-blue-500 dark:hover:border-blue-500/40 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <FontAwesomeIcon icon={faFileSignature} className="text-2xl text-indigo-500" />
                            </div>
                            <div className="text-left">
                              <p className="text-base font-bold text-bgray-900 dark:text-white">Promesa de Compra Venta</p>
                              <p className="text-xs font-medium text-bgray-400 dark:text-bgray-500">Contrato de promesa</p>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                        </button>
                      )}

                      {/* Rescisión de Contrato */}
                      {["cancelled", "canceled", "rejected"].includes(contract.status?.toLowerCase()) ? (
                        <button
                          onClick={() => handleDownloadDocument('user_rescission_contract_pdf', 'Rescisión de Contrato')}
                          className="w-full p-5 rounded-2xl bg-white dark:bg-darkblack-500 border border-bgray-100 dark:border-transparent hover:border-blue-500 dark:hover:border-blue-500/40 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <FontAwesomeIcon icon={faFileAlt} className="text-2xl text-amber-500" />
                            </div>
                            <div className="text-left">
                              <p className="text-base font-bold text-bgray-900 dark:text-white">Rescisión de Contrato</p>
                              <p className="text-xs font-medium text-bgray-400 dark:text-bgray-500">Documento de rescisión</p>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </div>
                        </button>
                      ) : (
                        <div className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-darkblack-500/50 border border-gray-200 dark:border-darkblack-400 opacity-50 cursor-not-allowed flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <FontAwesomeIcon icon={faFileAlt} className="text-2xl text-gray-400" />
                            </div>
                            <div className="text-left">
                              <p className="text-base font-bold text-gray-400 dark:text-gray-500">Rescisión de Contrato</p>
                              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">Solo disponible para contratos cancelados/rechazados</p>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Estado de Cuenta */}
                      <button
                        onClick={() => handleDownloadDocument('user_information_pdf', 'Estado de Cuenta')}
                        className="w-full p-5 rounded-2xl bg-white dark:bg-darkblack-500 border border-bgray-100 dark:border-transparent hover:border-blue-500 dark:hover:border-blue-500/40 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FontAwesomeIcon icon={faFileAlt} className="text-2xl text-emerald-500" />
                          </div>
                          <div className="text-left">
                            <p className="text-base font-bold text-bgray-900 dark:text-white">Estado de Cuenta</p>
                            <p className="text-xs font-medium text-bgray-400 dark:text-bgray-500">Detalle de movimientos y saldo</p>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div >
    </div >,
    document.body
  );
});

export default ContractDetailsModal;
