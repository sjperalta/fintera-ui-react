import { API_URL } from "../../../config";
import { getToken } from "../../../auth";
import { useToast } from "../../contexts/ToastContext";
import PropTypes from "prop-types";
import { useState } from "react";
import { createPortal } from "react-dom";

import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocale } from "../../contexts/LocaleContext";

function DocumentSelect({ contract_id, financing_type, status, customButtonClass = "", iconOnly = false }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const token = getToken();

  /**
   * Realiza la solicitud POST para descargar el documento.
   * URL y método siguiendo tu mismo esquema (/approve, /reject, /cancel).
   */
  const handleDownload = async (document_name, document_label) => {
    setDownloading(document_name);

    try {
      let endpoint = `${API_URL}/api/v1/reports/${document_name}?contract_id=${contract_id}`;
      if (financing_type && document_name === 'user_promise_contract_pdf') {
        endpoint += `&financing_type=${financing_type}`;
      }
      const response = await fetch(endpoint,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }
        }
      );

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
      setDropdownOpen(false);
    } catch (error) {
      showToast(`Error: ${error.message}`, "error");
      console.error(error);
    } finally {
      setDownloading(null);
    }
  };

  /**
   * Devuelve las opciones de documentos según el tipo de financiamiento y estado.
   */
  const getDocumentOptions = () => {
    const contractStatus = status?.toLowerCase();
    const canDownloadRescission = contractStatus === "cancelled" || contractStatus === "canceled" || contractStatus === "rejected";

    const options = [
      {
        key: "user_promise_contract_pdf",
        label: "Promesa de Compra Venta",
        icon: "📄",
        description: "Contrato de promesa",
        disabled: false
      },
      {
        key: "user_rescission_contract_pdf",
        label: "Rescisión de Contrato",
        icon: "📋",
        description: canDownloadRescission ? "Documento de rescisión" : "Solo disponible para contratos cancelados/rechazados",
        disabled: !canDownloadRescission
      },
      {
        key: "user_information_pdf",
        label: "Ficha de Cliente",
        icon: "👤",
        description: "Información del cliente",
        disabled: false
      },
    ];

    // Mostrar "Promesa de Compra Venta" solo si es direct, cash o bank
    if (!["direct", "cash", "bank"].includes(financing_type?.toLowerCase())) {
      return options.filter((opt) => opt.key !== "user_promise_contract_pdf");
    }

    return options;
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.document-select')) {
      setDropdownOpen(false);
    }
  };

  // Add click outside listener
  if (dropdownOpen) {
    document.addEventListener('click', handleClickOutside);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }

  return (
    <div className="document-select relative">
      <button
        aria-label="Document options"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        type="button"
        className={customButtonClass || "group relative inline-flex items-center px-3 py-2 text-xs font-semibold bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-white"}
      >
        <FontAwesomeIcon icon={faFolderOpen} className={iconOnly ? "" : "mr-2"} />
        {!iconOnly && <span className="text-white">{t('contracts.documents') || "Documentos"}</span>}
        {!iconOnly && (
          <svg
            className={`ml-1 w-3 h-3 transition-transform duration-200 text-white ${dropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-lg transition-opacity"></div>
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 top-full z-50 min-w-[240px] mt-2 overflow-hidden rounded-xl bg-white dark:bg-darkblack-600 shadow-xl border border-bgray-200 dark:border-darkblack-400">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-bgray-200 dark:border-darkblack-400">
              <p className="text-xs font-semibold text-bgray-600 dark:text-bgray-300 uppercase tracking-wide">
                Documentos Disponibles
              </p>
            </div>
            {getDocumentOptions().map(({ key, label, icon, description, disabled }) => (
              <button
                key={key}
                onClick={() => !disabled && handleDownload(key, label)}
                disabled={downloading === key || disabled}
                className={`w-full text-left px-4 py-3 transition-colors duration-150 disabled:cursor-not-allowed ${disabled
                  ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-bgray-50 dark:hover:bg-darkblack-500'
                  } ${downloading === key ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <span className={`text-lg flex-shrink-0 mt-0.5 ${disabled ? 'grayscale' : ''}`}>{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${disabled
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-bgray-900 dark:text-white'
                      }`}>
                      {downloading === key ? "Descargando..." : label}
                    </p>
                    <p className={`text-xs mt-0.5 ${disabled
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-bgray-500 dark:text-bgray-300'
                      }`}>
                      {description}
                    </p>
                  </div>
                  {downloading === key ? (
                    <div className="flex-shrink-0">
                      <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <span className={`text-xs flex-shrink-0 mt-0.5 ${disabled
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-bgray-400 dark:text-bgray-500'
                      }`}>
                      {disabled ? '🚫' : 'PDF'}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

DocumentSelect.propTypes = {
  contract_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  financing_type: PropTypes.string,
  status: PropTypes.string.isRequired,
  customButtonClass: PropTypes.string,
  iconOnly: PropTypes.bool,
};

export default DocumentSelect;