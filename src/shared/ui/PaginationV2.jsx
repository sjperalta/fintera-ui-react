import PropTypes from "prop-types";

function PaginationV2({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onPageClick,
  className,
}) {
  /**
   * Generate an array of pages to display, including neighbors.
   */
  const getPageArray = () => {
    const pageArray = [];

    // Always show the first page
    pageArray.push(1);

    // Add "..." before current page if needed
    if (currentPage > 3) {
      pageArray.push("...");
    }

    // Add the current page and neighbors
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i > 1 && i < totalPages) {
        pageArray.push(i);
      }
    }

    // Add "..." after current page if needed
    if (currentPage < totalPages - 2) {
      pageArray.push("...");
    }

    // Always show the last page
    if (totalPages > 1) {
      pageArray.push(totalPages);
    }

    return pageArray;
  };

  const pageArray = getPageArray();

  return (
    <div className={`flex items-center space-x-5 sm:space-x-[35px] ${className}`}>
      {/* Prev Button */}
      <button
        aria-label="Previous Page"
        type="button"
        onClick={() => onPrev?.(currentPage - 1)}
        disabled={currentPage <= 1}
        className="text-gray-600 disabled:opacity-50"
      >
        <span>
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.7217 5.03271L7.72168 10.0327L12.7217 15.0327"
              stroke="#A0AEC0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* Pages */}
      <div className="flex items-center gap-2">
        {pageArray.map((page, index) => {
          if (page === "...") {
            return (
              <span key={`dots-${index}`} className="text-sm text-gray-500">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              aria-label={`Go to page ${page}`}
              type="button"
              onClick={() => onPageClick?.(page)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold lg:px-6 lg:py-2.5 lg:text-sm ${
                isActive
                  ? "bg-success-50 text-success-300 dark:bg-darkblack-500 dark:text-bgray-50"
                  : "text-bgray-500 hover:bg-success-50 hover:text-success-300 dark:hover:bg-darkblack-500"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        aria-label="Next Page"
        type="button"
        onClick={() => onNext?.(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="text-gray-600 disabled:opacity-50"
      >
        <span>
          <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.72168 5.03271L12.7217 10.0327L7.72168 15.0327"
              stroke="#A0AEC0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </div>
  );
}

PaginationV2.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPageClick: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default PaginationV2;