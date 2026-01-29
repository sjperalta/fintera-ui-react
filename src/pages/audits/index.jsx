import { useState, useEffect, useContext, useCallback } from "react";
import SearchFilterBar from "../../component/ui/SearchFilterBar";
import AuditTimeline from "../../component/audit/AuditTimeline";
import { useLocale } from "../../contexts/LocaleContext";
import { API_URL } from "../../../config";
import AuthContext from "../../context/AuthContext";

/**
 * Audits page component that displays audit logs using a Timeline layout
 */
function Audits() {
  const { t } = useLocale();
  const { token } = useContext(AuthContext);

  // State
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState({
    model: "",
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const PER_PAGE = 20;

  const modelFilterOptions = [
    { value: "", label: t("audits.filterByModel") },
    { value: "Contract", label: "Contract" },
    { value: "Lot", label: "Lot" },
    { value: "User", label: "User" },
    { value: "Project", label: "Project" },
    { value: "Payment", label: "Payment" },
  ];

  const fetchAudits = useCallback(async (pageNum, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const params = new URLSearchParams();
      params.append("page", pageNum);
      params.append("per_page", PER_PAGE);
      params.append("sort", "created_at-desc");

      if (searchTerm) params.append("search_term", searchTerm);
      if (filterState.model) params.append("model", filterState.model);

      const response = await fetch(`${API_URL}/api/v1/audits?${params.toString()}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch audits");

      const data = await response.json();
      const newItems = data.audits || [];
      const total = data.pagination?.total || 0;

      setAudits(prev => reset ? newItems : [...prev, ...newItems]);
      setHasMore(newItems.length === PER_PAGE && (pageNum * PER_PAGE) < total);

    } catch (err) {
      console.error("Error fetching audits:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, filterState.model]);

  // Initial fetch and filter changes
  useEffect(() => {
    setPage(1);
    fetchAudits(1, true);
  }, [fetchAudits]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAudits(nextPage, false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (value) => {
    setFilterState(prev => ({ ...prev, model: value }));
  };

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] sm:pt-[156px] pt-[100px] dark:bg-darkblack-700 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Search and Filters */}
        <SearchFilterBar
          id="audits-filter-section"
          searchTerm={searchTerm}
          filterValue={filterState.model}
          filterOptions={modelFilterOptions}
          onSearchChange={handleSearch}
          onFilterChange={handleFilter}
          searchPlaceholder={t("audits.searchPlaceholder")}
          filterPlaceholder={t("audits.filterByModel")}
          showFilter={true}
        />

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : audits.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-50 dark:bg-darkblack-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No audits found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div id="audits-timeline">
              <AuditTimeline items={audits} />
            </div>

            {/* Load More Trigger */}
            {hasMore && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${loadingMore
                    ? "bg-gray-100 dark:bg-darkblack-600 text-gray-400 cursor-not-allowed"
                    : "bg-white dark:bg-darkblack-600 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-darkblack-400 hover:bg-gray-50 dark:hover:bg-darkblack-500 shadow-sm hover:shadow-md"
                    }`}
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      Loading...
                    </span>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default Audits;
