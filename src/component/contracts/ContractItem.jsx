import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faClipboardList,
  faLock,
  faInfoCircle,
  faReceipt,
  faEye,
  faCreditCard,
  faCalendarAlt,
  faHome,
  faTrashAlt
} from "@fortawesome/free-solid-svg-icons";

import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import { formatStatus } from "../../utils/formatStatus";
import { useLocale } from "../../contexts/LocaleContext";
import { useToast } from "../../contexts/ToastContext";
import PaymentScheduleModal from "./PaymentScheduleModal";
import RejectionModal from "./RejectionModal";
import ContractDetailsModal from "./ContractDetailsModal";
import { createPortal } from "react-dom";

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
        shadow: "shadow-[0_0_15px_rgba(234,179,8,0.1)]"
      };
    case "submitted":
      return {
        bg: "bg-blue-50 dark:bg-blue-900/10",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-300 dark:border-blue-500/40",
        icon: faClipboardList,
        color: "#3B82F6",
        shadow: "shadow-[0_0_15px_rgba(59,130,246,0.1)]"
      };
    case "approved":
      return {
        bg: "bg-green-50 dark:bg-green-900/10",
        text: "text-green-700 dark:text-green-400",
        border: "border-green-300 dark:border-green-500/40",
        icon: faCheckCircle,
        color: "#22C55E",
        shadow: "shadow-[0_0_15px_rgba(34,197,94,0.1)]"
      };
    case "rejected":
      return {
        bg: "bg-red-50 dark:bg-red-900/10",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-300 dark:border-red-500/40",
        icon: faTimesCircle,
        color: "#EF4444",
        shadow: "shadow-[0_0_15px_rgba(239,68,68,0.1)]"
      };
    case "closed":
      return {
        bg: "bg-blue-50 dark:bg-blue-900/10",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-300 dark:border-blue-500/40",
        icon: faLock,
        color: "#3B82F6",
        shadow: "shadow-[0_0_15px_rgba(59,130,246,0.1)]"
      };
    default:
      return {
        bg: "bg-gray-50 dark:bg-gray-900/10",
        text: "text-gray-700 dark:text-gray-400",
        border: "border-gray-200 dark:border-gray-800/30",
        icon: faInfoCircle,
        color: "#6B7280"
      };
  }
};

const formatDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function ContractItem({
  contract,
  userRole,
  refreshContracts,
  isMobileCard = false,
}) {
  const { showToast } = useToast();
  const token = getToken();
  const navigate = useNavigate();
  const [showSchedule, setShowSchedule] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { t } = useLocale();

  const statusTheme = getStatusTheme(contract.status);

  // Navigation handlers
  const handleNavigateToClient = (e) => {
    e.stopPropagation();
    navigate("/users", {
      state: {
        selectedUserId: contract.applicant_identity,
        selectedUserName: contract.applicant_name,
        selectedUserPhone: contract.applicant_phone,
      },
    });
  };

  const handleNavigateToLot = (e) => {
    e.stopPropagation();
    if (contract.project_id) {
      navigate(`/projects/${contract.project_id}/lots`, {
        state: {
          selectedLotId: contract.lot_id,
          selectedLotName: contract.lot_name,
          selectedLotAddress: contract.lot_address,
        },
      });
    }
  };

  const handleApprove = async (e) => {
    e?.stopPropagation();
    if (!contract.id) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${contract.project_id}/lots/${contract.lot_id}/contracts/${contract.id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Error aprobando el contrato.");
      showToast("Contrato aprobado exitosamente.", "success");
      refreshContracts();
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason) => {
    if (!contract.id) return;
    setActionLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/v1/projects/${contract.project_id}/lots/${contract.lot_id}/contracts/${contract.id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );
      if (!response.ok) throw new Error("Error rechazando el contrato.");
      showToast("Contrato rechazado exitosamente.", "success");
      setShowRejectionModal(false);
      refreshContracts();
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const [deleteLoading, setDeleteLoading] = useState(false);
  const handleDeleteContract = async (e) => {
    e?.stopPropagation();
    if (!contract?.id || !token) return;
    if (!window.confirm(t("contractDetailsModal.deleteConfirm"))) return;
    setDeleteLoading(true);
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
      if (!response.ok) throw new Error(data.error || t("contractDetailsModal.errorDeleting"));
      showToast(data.message || t("contractDetailsModal.deletedSuccess"), "success");
      refreshContracts();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Card View (Mobile or Desktop Grid)
  if (isMobileCard) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{
          y: -8,
          scale: 1.01,
          boxShadow: `0 20px 25px -5px ${statusTheme.color}20, 0 8px 10px -6px ${statusTheme.color}20`,
          transition: { duration: 0.2 }
        }}
        className={`relative group bg-white dark:bg-darkblack-600 rounded-[2.5rem] border-2 ${statusTheme.border} ${statusTheme.shadow} transition-all duration-300 w-full h-full flex flex-col overflow-hidden`}
      >

        {/* Top-Right Menu & Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
          {userRole !== "seller" && ["approved", "closed"].includes(contract.status?.toLowerCase()) && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowSchedule(true); }}
              id="contract-schedule-btn"
              title={t("contracts.paymentSchedule")}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-lg hover:scale-110 active:scale-95"
            >
              <FontAwesomeIcon icon={faReceipt} className="text-sm" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setShowDetailsModal(true); }}
            id="contract-view-details-btn"
            title={t("common.view")}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-lg hover:scale-110 active:scale-95"
          >
            <FontAwesomeIcon icon={faEye} className="text-sm" />
          </button>

        </div>

        <div className="p-5 flex-1 flex flex-col">
          {/* Header: Lot and Status */}
          <div className="mb-4 pr-24">
            <div
              onClick={handleNavigateToLot}
              className="cursor-pointer group/title min-h-[60px]"
            >
              <h3 className="text-xl font-bold text-bgray-900 dark:text-white group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400 transition-colors leading-tight line-clamp-2">
                {contract.lot_name || "N/A"}
              </h3>
              <p className="text-xs text-bgray-600 dark:text-bgray-400 font-bold flex items-center mt-1.5 truncate">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1.5 text-bgray-400 group-hover/title:text-blue-500 transition-colors" />
                {contract.project_name || "—"}
              </p>
            </div>
          </div>

          <div className={`inline-flex self-start px-2.5 py-1 rounded-full ${statusTheme.bg} ${statusTheme.text} text-[9px] font-extrabold uppercase tracking-widest border ${statusTheme.border} items-center mb-5 shadow-sm`}>
            <FontAwesomeIcon icon={statusTheme.icon} className="mr-1.5" />
            {formatStatus(contract.status?.toLowerCase(), t)}
          </div>

          {/* Client Info */}
          <div
            onClick={handleNavigateToClient}
            className="flex items-center p-3 bg-gray-50 dark:bg-darkblack-500 rounded-xl mb-5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-blue-800/30 shadow-subtle"
          >
            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md uppercase text-sm">
              {contract.applicant_name?.charAt(0) || "?"}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-bgray-900 dark:text-white truncate">
                {contract.applicant_name || "N/A"}
              </p>
              <p className="text-[10px] text-bgray-600 dark:text-bgray-400 font-mono mt-1 truncate">
                {contract.applicant_identity || "—"}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 px-1">
            <div className="space-y-1">
              <p className="text-[9px] uppercase font-bold text-bgray-500 dark:text-bgray-500 tracking-widest">
                {t("contracts.financing")}
              </p>
              <p className="text-xs font-bold text-bgray-800 dark:text-bgray-300 flex items-center truncate">
                <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-blue-500 opacity-70" />
                {translateFinancingType(contract.financing_type, t)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] uppercase font-bold text-bgray-500 dark:text-bgray-500 tracking-widest text-right">
                {t("contracts.created")}
              </p>
              <p className="text-xs font-bold text-bgray-800 dark:text-bgray-300 flex items-center justify-end truncate">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-indigo-500 opacity-70" />
                {formatDate(contract.created_at)}
              </p>
            </div>
          </div>

          {/* Payment Progress Indicator */}
          {["approved", "closed"].includes(contract.status?.toLowerCase()) && contract.amount > 0 && (
            <div className="mb-5 bg-gray-50 dark:bg-darkblack-500 rounded-xl p-3 border border-gray-100 dark:border-darkblack-400">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-[10px] uppercase font-bold text-bgray-500 dark:text-bgray-400 tracking-wider mb-1">
                    {t("contracts.balance")?.includes("contracts.balance") ? "Saldo Pendiente" : (t("contracts.balance") || "Saldo Pendiente")}
                  </p>
                  <p className="text-base font-extrabold text-bgray-900 dark:text-white">
                    {new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(contract.balance)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-bgray-500 dark:text-bgray-400 tracking-wider mb-1">
                    {t("contracts.total") || "Total Deuda"}
                  </p>
                  <p className="text-xs font-bold text-bgray-700 dark:text-bgray-300">
                    {new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(contract.amount)}
                  </p>
                </div>
              </div>

              <div className="relative h-2 w-full bg-gray-200 dark:bg-darkblack-300 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${((Number(contract.total_paid ?? (Number(contract.amount) - Number(contract.balance)))) / Number(contract.amount || 1)) >= 1
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                    }`}
                  style={{
                    width: `${Math.max(0, Math.min(100, ((Number(contract.total_paid ?? (Number(contract.amount) - Number(contract.balance)))) / Number(contract.amount || 1)) * 100))}%`
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  {new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(
                    Number(contract.total_paid ?? (Number(contract.amount) - Number(contract.balance)))
                  )} / {new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' }).format(contract.amount)}
                </p>
              </div>
            </div>
          )}

          {/* Rejection Reason if any */}
          {contract.status?.toLowerCase() === "rejected" && contract.rejection_reason && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl">
              <p className="text-[9px] font-bold text-red-800 dark:text-red-400 uppercase tracking-wider mb-1">
                {t("contracts.rejectionReason")}
              </p>
              <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed italic line-clamp-2" title={contract.rejection_reason}>
                "{contract.rejection_reason}"
              </p>
            </div>
          )}

          {/* Critical Admin Actions at the bottom */}
          {userRole === "admin" && ["pending", "submitted", "rejected"].includes(contract.status?.toLowerCase()) && (
            <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-darkblack-500 mt-auto">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold shadow-sm shadow-green-200 dark:shadow-none transition-all flex items-center justify-center disabled:opacity-50"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                {t("contracts.approve")}
              </button>
              {contract.status?.toLowerCase() === "rejected" ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDeleteContract(e); }}
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-sm shadow-red-200 dark:shadow-none transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
                      {t("contractDetailsModal.deleteContract")}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowRejectionModal(true); }}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-sm shadow-red-200 dark:shadow-none transition-all flex items-center justify-center disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />
                  {t("contracts.reject")}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {
          showSchedule && userRole !== "seller" && createPortal(
            <PaymentScheduleModal
              contract={contract}
              open={showSchedule}
              onClose={() => setShowSchedule(false)}
              onPaymentSuccess={refreshContracts}
            />,
            document.body
          )
        }
        <RejectionModal isOpen={showRejectionModal} onClose={() => setShowRejectionModal(false)} onSubmit={handleReject} loading={actionLoading} />
        <ContractDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          contract={contract}
          onContractDeleted={() => {
            setShowDetailsModal(false);
            refreshContracts();
          }}
        />
      </motion.div >
    );
  }

  // Table Row View
  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.005, transition: { duration: 0.2 } }}
      className="group border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
    >
      <td className="px-6 py-4">
        <div onClick={handleNavigateToLot} className="group cursor-pointer flex items-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 mr-3 group-hover:bg-green-100 dark:group-hover:bg-green-900/40 transition-colors border border-green-100 dark:border-green-900/20 shadow-sm">
            <FontAwesomeIcon icon={faHome} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-bgray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors truncate">
              {contract.lot_name || "N/A"}
            </p>
            <p className="text-[10px] text-bgray-500 dark:text-bgray-400 flex items-center mt-0.5 truncate uppercase tracking-tight font-medium">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 opacity-50 text-[8px]" />
              {contract.project_name || "—"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <div onClick={handleNavigateToClient} className="group cursor-pointer flex items-center">
          <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-md mr-3 group-hover:scale-105 transition-transform uppercase">
            {contract.applicant_name?.charAt(0) || "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-bgray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {contract.applicant_name || "N/A"}
            </p>
            <p className="text-[10px] text-bgray-500 dark:text-bgray-400 font-mono mt-0.5 truncate">
              {contract.applicant_identity || "—"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-800/20 shadow-sm">
          <FontAwesomeIcon icon={faCreditCard} className="mr-2 opacity-70" />
          {translateFinancingType(contract.financing_type, t)}
        </div>
      </td>

      <td className="px-6 py-4">
        <div className="flex flex-col items-center gap-1.5">
          <div className={`px-4 py-1.5 rounded-full ${statusTheme.bg} ${statusTheme.text} text-[10px] font-bold uppercase tracking-wider border ${statusTheme.border} flex items-center shadow-sm`}>
            <FontAwesomeIcon icon={statusTheme.icon} className="mr-2" />
            {formatStatus(contract.status?.toLowerCase(), t)}
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <div className="inline-flex flex-col items-center">
          <p className="text-xs font-bold text-bgray-800 dark:text-bgray-200">
            {formatDate(contract.created_at)}
          </p>
          <div className="flex items-center mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-1.5" />
            <p className="text-[10px] font-medium text-bgray-400 uppercase tracking-tighter">
              {t("contracts.created")}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-center">
        <p className="text-xs font-semibold text-bgray-700 dark:text-bgray-300">
          {contract.created_by || "—"}
        </p>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {userRole === "admin" && ["pending", "submitted", "rejected"].includes(contract.status?.toLowerCase()) && (
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              title={t("contracts.approve")}
              className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center border border-green-200 dark:border-green-800/30 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faCheckCircle} />
            </button>
          )}

          {userRole === "admin" && ["pending", "submitted"].includes(contract.status?.toLowerCase()) && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowRejectionModal(true); }}
              disabled={actionLoading}
              title={t("contracts.reject")}
              className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-200 dark:border-red-800/30 disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faTimesCircle} />
            </button>
          )}

          {userRole === "admin" && contract.status?.toLowerCase() === "rejected" && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleDeleteContract(e); }}
              disabled={deleteLoading}
              title={t("contractDetailsModal.deleteContract")}
              className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-200 dark:border-red-800/30 disabled:opacity-50"
            >
              {deleteLoading ? (
                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faTrashAlt} />
              )}
            </button>
          )}

          {userRole !== "seller" && ["approved", "closed"].includes(contract.status?.toLowerCase()) && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowSchedule(true); }}
              title={t("contracts.paymentSchedule")}
              className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center border border-indigo-200 dark:border-indigo-800/30"
            >
              <FontAwesomeIcon icon={faReceipt} />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowDetailsModal(true); }}
            title={t("common.view")}
            className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center border border-blue-200 dark:border-blue-800/30"
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
        </div>
      </td>

      {/* Modals are handled inside GenericList but for now keeping them here if needed */}
      {showSchedule && userRole !== "seller" && createPortal(
        <PaymentScheduleModal
          contract={contract}
          open={showSchedule}
          onClose={() => setShowSchedule(false)}
          onPaymentSuccess={refreshContracts}
        />,
        document.body
      )}
      <RejectionModal isOpen={showRejectionModal} onClose={() => setShowRejectionModal(false)} onSubmit={handleReject} loading={actionLoading} />
      <ContractDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        contract={contract}
        onContractDeleted={() => {
          setShowDetailsModal(false);
          refreshContracts();
        }}
      />
    </motion.tr>
  );
}

ContractItem.propTypes = {
  contract: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    applicant_name: PropTypes.string,
    applicant_phone: PropTypes.string,
    applicant_identity: PropTypes.string,
    created_by: PropTypes.string,
    lot_name: PropTypes.string,
    project_name: PropTypes.string,
    financing_type: PropTypes.string,
    status: PropTypes.string,
    created_at: PropTypes.string,
    project_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lot_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    rejection_reason: PropTypes.string,
  }).isRequired,
  userRole: PropTypes.string.isRequired,
  refreshContracts: PropTypes.func.isRequired,
  isMobileCard: PropTypes.bool,
};

export default ContractItem;
