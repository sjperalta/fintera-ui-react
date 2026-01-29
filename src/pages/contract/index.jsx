import { useState, useContext, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faThLarge,
  faList,
  faPlus,
  faSync
} from "@fortawesome/free-solid-svg-icons";

import { useLocale } from "../../contexts/LocaleContext";
import AuthContext from "../../context/AuthContext";
import GenericList from "../../component/ui/GenericList";
import GenericFilter from "../../component/forms/GenericFilter";
import ContractItem from "../../component/contracts/ContractItem";
import ContractStats from "../../component/contracts/ContractStats";
import { API_URL } from "../../../config";
import { getToken } from "../../../auth";

function Contract() {
  const { user } = useContext(AuthContext);
  const { t } = useLocale();
  const token = getToken();

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "table"
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch stats separately to keep it clean
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/contracts?per_page=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          const items = data.contracts || data.items || [];

          const newStats = {
            total: data.pagination?.total_items || items.length,
            pending: items.filter(i => i.status?.toLowerCase() === "pending").length,
            approved: items.filter(i => i.status?.toLowerCase() === "approved").length,
            rejected: items.filter(i => i.status?.toLowerCase() === "rejected").length,
          };
          setStats(newStats);
        }
      } catch (error) {
        console.error("Error fetching contract stats:", error);
      }
    };
    fetchStats();
  }, [token, refreshTrigger]);

  // Status filter options
  const statusOptions = useMemo(
    () => [
      { value: "", label: t('contracts.allStatuses') },
      { value: "pending", label: t('contracts.status.pending') },
      { value: "submitted", label: t('contracts.status.submitted') },
      { value: "approved", label: t('contracts.status.approved') },
      { value: "rejected", label: t('contracts.status.rejected') },
      { value: "cancelled", label: t('contracts.status.cancelled') },
      { value: "closed", label: t('contracts.status.closed') },
    ],
    [t]
  );

  const columns = useMemo(
    () => [
      {
        label: t('contracts.lot'),
        align: "left",
        sortKey: "lot_id",
        defaultSortDirection: "asc",
      },
      {
        label: t('contracts.client'),
        align: "left",
        sortKey: "applicant_user_id",
        defaultSortDirection: "asc",
      },
      {
        label: t('contracts.financing'),
        align: "center",
        sortKey: "financing_type",
        defaultSortDirection: "asc",
      },
      {
        label: t('common.status'),
        align: "center",
        sortKey: "status",
        defaultSortDirection: "asc",
      },
      {
        label: t('contracts.created'),
        align: "center",
        sortKey: "contracts.created_at",
        defaultSortDirection: "desc",
      },
      { label: t('contracts.createdBy'), align: "center" },
      { label: t('contracts.actions'), align: "center" },
    ],
    [t]
  );

  const refreshContracts = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const renderContractItem = useCallback(
    (contract, index, isMobileCard) => {
      // Force card view for grid mode even on desktop
      const forceCard = viewMode === "grid" || isMobileCard;
      return (
        <ContractItem
          key={contract.id}
          contract={contract}
          userRole={user?.role}
          refreshContracts={refreshContracts}
          isMobileCard={forceCard}
        />
      );
    },
    [user?.role, refreshContracts, viewMode]
  );

  const filters = useMemo(() => {
    const obj = {};
    if (searchTerm) obj.search_term = searchTerm;
    if (statusFilter) obj.status = statusFilter;
    if (startDate) obj.start_date = startDate;
    if (endDate) obj.end_date = endDate;
    return obj;
  }, [searchTerm, statusFilter, startDate, endDate]);

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-end mb-4 gap-4"
        >
          <div className="flex items-center space-x-3">
            <div id="view-mode-toggles" className="flex bg-white dark:bg-darkblack-600 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-darkblack-500">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-blue-500 text-white shadow-md" : "text-bgray-400 hover:text-bgray-600 dark:hover:text-bgray-200"}`}
              >
                <FontAwesomeIcon icon={faThLarge} className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-blue-500 text-white shadow-md" : "text-bgray-400 hover:text-bgray-600 dark:hover:text-bgray-200"}`}
              >
                <FontAwesomeIcon icon={faList} className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={refreshContracts}
              className="p-3 bg-white dark:bg-darkblack-600 hover:bg-gray-50 dark:hover:bg-darkblack-500 rounded-xl shadow-sm border border-gray-100 dark:border-darkblack-500 text-bgray-600 dark:text-bgray-300 transition-all"
            >
              <FontAwesomeIcon icon={faSync} className={`w-4 h-4 ${refreshTrigger > 0 ? 'animate-spin-once' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <div id="contract-stats">
          <ContractStats stats={stats} />
        </div>

        {/* Filters and List Section */}
        <div className="bg-white dark:bg-darkblack-600 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-darkblack-500">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-40">
            <div className="flex-1" id="contracts-filter-section">
              <GenericFilter
                searchTerm={searchTerm}
                filterValue={statusFilter}
                filterOptions={statusOptions}
                onSearchChange={setSearchTerm}
                onFilterChange={setStatusFilter}
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                searchPlaceholder={t("contracts.searchPlaceholder")}
                filterPlaceholder={t("contracts.filterByStatus")}
                minSearchLength={3}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <GenericList
                endpoint="/api/v1/contracts"
                renderItem={renderContractItem}
                filters={filters}
                columns={columns}
                sortBy="contracts.created_at-desc"
                itemsPerPage={12}
                emptyMessage={t("contracts.noContractsFound")}
                loadingMessage={t("contracts.loadingContracts")}
                entityName="contracts"
                showMobileCards={true}
                showDesktopTable={viewMode === "table"}
                refreshTrigger={refreshTrigger}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

export default Contract;
