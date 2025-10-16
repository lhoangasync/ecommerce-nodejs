interface ReviewFiltersProps {
  filterRating: string;
  onFilterChange: (rating: string) => void;
  sortBy: "created_at" | "rating" | "helpful_count";
  onSortChange: (sort: "created_at" | "rating" | "helpful_count") => void;
}

export default function ReviewFilters({
  filterRating,
  onFilterChange,
  sortBy,
  onSortChange,
}: ReviewFiltersProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        {filterRating && (
          <button
            onClick={() => onFilterChange("")}
            className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
          >
            <span>{filterRating} sao</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      <select
        value={sortBy}
        onChange={(e) =>
          onSortChange(
            e.target.value as "created_at" | "rating" | "helpful_count"
          )
        }
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
      >
        <option value="created_at">Mới nhất</option>
        <option value="rating">Đánh giá cao nhất</option>
        <option value="helpful_count">Hữu ích nhất</option>
      </select>
    </div>
  );
}
