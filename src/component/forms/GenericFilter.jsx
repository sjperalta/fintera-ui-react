import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";

/**
 * A reusable filter component:
 * - Provides a search input (debounced).
 * - Provides a dropdown of filter options.
 * - Calls parent callbacks on changes.
 *
 * Props:
 *  - searchTerm (string): initial value for search input.
 *  - filterValue (string): the currently selected filter option.
 *  - filterOptions (array): array of string options for the dropdown.
 *  - onSearchChange (func): called when search input changes (debounced).
 *  - onFilterChange (func): called when a filter option is selected.
 *  - searchPlaceholder (string): placeholder text for the search input.
 *  - filterPlaceholder (string): placeholder text for the dropdown input.
 *  - minSearchLength (number): minimum length to trigger onSearchChange (default 3).
 */
function GenericFilter({
  searchTerm = "",
  filterValue = "",
  filterOptions = ["All", "Option1", "Option2"],
  onSearchChange = () => { },
  onFilterChange = () => { },
  searchPlaceholder = "Search...",
  filterPlaceholder = "Select Filter",
  minSearchLength = 3,
}) {
  const [term, setTerm] = useState(searchTerm);
  const [selectedFilter, setSelectedFilter] = useState(filterValue);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilterLabel, setActiveFilterLabel] = useState("");

  // Debounced callback to notify parent about search changes
  const debouncedSearch = useCallback(
    debounce((value) => {
      if (value.length >= minSearchLength) {
        onSearchChange(value);
      } else {
        onSearchChange("");
      }
    }, 500),
    [onSearchChange, minSearchLength]
  );

  // Cleanup on unmount (cancels pending debounced calls)
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle local input changes (search)
  const handleTermChange = (e) => {
    const val = e.target.value;
    setTerm(val);
    debouncedSearch(val);
  };

  // Handle filter selection
  const handleFilterSelect = (option) => {
    setSelectedFilter(option);
    setActiveFilterLabel(option);
    setShowFilter(false);
    onFilterChange(option === "All" ? "" : option);
  };

  // If parent modifies props externally, sync them in
  useEffect(() => {
    setTerm(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setSelectedFilter(filterValue);
    setActiveFilterLabel(filterValue || "");
  }, [filterValue]);

  return (
    <div className="bg-white dark:bg-darkblack-600 rounded-2xl p-2 flex flex-col md:flex-row items-center gap-2 border border-bgray-200 dark:border-darkblack-400 shadow-sm">
      {/* Search Section */}
      <div className="flex items-center flex-1 w-full bg-bgray-50 dark:bg-darkblack-500 rounded-xl px-4 py-2 group focus-within:ring-2 focus-within:ring-success-300/30 transition-all duration-200">
        <span className="text-bgray-400 group-focus-within:text-success-300 transition-colors">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 21L17 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <input
          type="text"
          className="bg-transparent border-0 w-full dark:text-white focus:outline-none focus:ring-0 ml-3 text-sm font-medium placeholder:text-bgray-400"
          placeholder={searchPlaceholder}
          value={term}
          onChange={handleTermChange}
        />
      </div>

      {/* Filter Dropdown */}
      <div className="relative w-full md:w-auto">
        <div
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center justify-between bg-white dark:bg-darkblack-600 border ${showFilter ? 'border-success-300 ring-4 ring-success-300/10' : 'border-bgray-200 dark:border-darkblack-400'} rounded-xl px-4 py-2 cursor-pointer transition-all duration-200 hover:border-success-300 min-w-[160px]`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={showFilter || activeFilterLabel ? 'text-success-300' : 'text-bgray-400'}
            >
              <path
                d="M3 4.5H21M6.75 12H17.25M10.5 19.5H13.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={`text-sm font-bold truncate ${activeFilterLabel ? 'text-bgray-900 dark:text-white' : 'text-bgray-400'}`}>
              {activeFilterLabel || filterPlaceholder}
            </span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-200 ml-2 ${showFilter ? 'rotate-180 text-success-300' : 'text-bgray-400'}`}
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Dropdown list */}
        {showFilter && (
          <div
            className="absolute top-full right-0 w-full md:w-56 bg-white dark:bg-darkblack-500 rounded-2xl shadow-xl z-50 mt-2 border border-bgray-100 dark:border-darkblack-400 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <ul className="py-1">
              {filterOptions.map((option) => (
                <li
                  key={option}
                  className={`px-4 py-2.5 text-sm transition-colors border-l-2 ${selectedFilter === option ? 'bg-success-50 dark:bg-success-400/10 text-success-400 border-success-300 font-bold' : 'text-bgray-700 dark:text-bgray-300 border-transparent hover:bg-bgray-50 dark:hover:bg-darkblack-600 font-medium'} cursor-pointer`}
                  onClick={() => {
                    handleFilterSelect(option);
                  }}
                >
                  {option === "No Sort" ? "Default Sort" : option}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

GenericFilter.propTypes = {
  searchTerm: PropTypes.string,
  filterValue: PropTypes.string,
  filterOptions: PropTypes.arrayOf(PropTypes.string),
  onSearchChange: PropTypes.func,
  onFilterChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  filterPlaceholder: PropTypes.string,
  minSearchLength: PropTypes.number,
};

export default GenericFilter;