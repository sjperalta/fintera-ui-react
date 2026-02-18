
// src/component/contracts/ContractDetailsModal.jsx
import { createPortal } from "react-dom";
import { useState, useContext, useEffect, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faUser,
  faChartLine,
  faDollarSign,
  faStickyNote,
  faTimes,
  faEdit,
  faWindowClose,
  faTrashAlt,
  faFileAlt,
  faClock,
  faClipboardList,
  faExclamationTriangle,
  faLock,
  faBan,
  faCheckCircle,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import { formatStatus } from "../../../shared/utils/formatStatus";
import { useLocale } from "../../../contexts/LocaleContext";
import { useToast } from "../../../contexts/ToastContext";
import { contractsApi } from "../api";
import AuthContext from "../../../contexts/AuthContext";
import OverviewTab from "./ContractDetails/tabs/OverviewTab";
import LotProjectTab from "./ContractDetails/tabs/LotProjectTab";
import FinancialTab from "./ContractDetails/tabs/FinancialTab";
import ApplicantTab from "./ContractDetails/tabs/ApplicantTab";
import DocumentsTab from "./ContractDetails/tabs/DocumentsTab";
import ContractNotesTab from "./ContractNotesTab";
import {
  getStatusTheme,
} from "../../../shared/utils/statusUtils";
import { formatCurrency } from "../../../shared/utils/formatters";

// Translate financing type
const translateFinancingType = (type, t) => {
  switch (type?.toLowerCase()) {
    case "direct":
      return t("contracts.financingTypes.direct") || "Directo";
    case "cash":
      return "Contado";
    case "bank":
      return t("contracts.financingTypes.bank") || "Bancario";
    default:
      return "N/A";
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
  const { showToast } = useToast();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [fullContract, setFullContract] = useState(null);
  const [isLoadingFull, setIsLoadingFull] = useState(false);

  const statusTheme = useMemo(() => getStatusTheme(contract?.status), [contract?.status]);

  const tabs = useMemo(() => [
    { id: 'overview', label: t('common.overview') || 'Resumen', icon: faChartLine },
    { id: 'financial', label: t('contracts.financial') || 'Financiero', icon: faDollarSign },
    { id: 'lot_project', label: t('contracts.lotAndProject') || 'Lote y Proyecto', icon: faBuilding },
    { id: 'applicant', label: t('contracts.applicant') || 'Solicitante', icon: faUser },
    { id: 'notes', label: t('contracts.notes') || 'Notas', icon: faStickyNote, show: !!contract.note || !!contract.rejection_reason }, // Always show notes tab if notes exist or user wants to add them? Usually depends on design.
    { id: 'documents', label: t('contracts.documents') || 'Documentos', icon: faFileAlt },
  ], [t, contract.note, contract.rejection_reason]);

  const canEditSchedule = useMemo(() => {
    const s = contract?.status?.toLowerCase();
    return s === "pending" || s === "rejected" || s === "submitted";
  }, [contract?.status]);

  // Fetch full contract details (including payment schedule)
  useEffect(() => {
    const fetchFullContract = async () => {
      if (!contract?.id || !token) return;

      setIsLoadingFull(true);
      try {
        const data = await contractsApi.getDetails(
          contract.project_id,
          contract.lot_id,
          contract.id
        );
        setFullContract(data.contract || null);
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
      setIsEditMode(false);
      setActiveTab("overview");
    }
  }, [isOpen, contract?.id, contract?.project_id, contract?.lot_id, token]);

  const handleDeleteContract = async () => {
    if (!contract?.id || !token) return;
    if (!window.confirm(t("contractDetailsModal.deleteConfirm"))) return;
    setIsDeleting(true);
    try {
      const data = await contractsApi.delete(
        contract.project_id,
        contract.lot_id,
        contract.id
      );

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

  const handleFinancialSaveSuccess = useCallback((updatedContract) => {
    setFullContract((prev) => (prev ? { ...prev, ...updatedContract } : updatedContract));
    onContractUpdate?.(updatedContract);
  }, [onContractUpdate]);

  if (!isOpen || !contract) return null;

  const displayContract = fullContract || contract;
  // Calculate paid amount and progress for the overview tab
  const paidAmount = displayContract?.total_paid ?? (Number(displayContract?.amount || 0) - Number(displayContract?.balance || 0));
  const progressPercent = Math.min(100, Math.max(0, (paidAmount / (Number(displayContract?.amount) || 1)) * 100));

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
              <h3 className="text-xl font-black text-bgray-900 dark:text-white leading-tight flex items-center gap-3">
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
            {tabs.map((tab) => (tab.show !== false && (
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
              {tabs.find(t => t.id === activeTab)?.label}
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
                  <OverviewTab
                    contract={contract}
                    displayContract={displayContract}
                    paidAmount={paidAmount}
                    progressPercent={progressPercent}
                  />
                )}
                {activeTab === 'lot_project' && (
                  <LotProjectTab contract={contract} />
                )}
                {activeTab === 'financial' && (
                  <FinancialTab
                    contract={contract}
                    displayContract={displayContract}
                    fullContract={fullContract}
                    isEditMode={isEditMode}
                    setIsEditMode={setIsEditMode}
                    isLoadingFull={isLoadingFull}
                    onSaveSuccess={handleFinancialSaveSuccess}
                  />
                )}
                {activeTab === 'applicant' && (
                  <ApplicantTab contract={contract} />
                )}
                {activeTab === 'notes' && (
                  <ContractNotesTab
                    currentContract={displayContract}
                    onContractUpdate={onContractUpdate}
                  />
                )}
                {activeTab === 'documents' && (
                  <DocumentsTab contract={contract} />
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
