
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faFileSignature, faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/contexts/ToastContext";
import AuthContext from "@/contexts/AuthContext";
import { useContext } from "react";
import { contractsApi } from "../../../api";

const DocumentsTab = ({ contract }) => {
    const { t } = useLocale();
    const { showToast } = useToast();
    const { token } = useContext(AuthContext);

    const handleDownloadCustomerRecord = async () => {
        try {
            showToast(t("common.processing"), "info");
            const blob = await contractsApi.downloadCustomerRecord(contract.id);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");

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

            const params = { contract_id: contract.id };
            if (contract.financing_type && document_name === 'user_promise_contract_pdf') {
                params.financing_type = contract.financing_type;
            }

            if (contract.applicant_user_id) {
                params.user_id = contract.applicant_user_id;
            }

            const blob = await contractsApi.downloadDocument(document_name, params);

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

    return (
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
    );
};
export default DocumentsTab;
