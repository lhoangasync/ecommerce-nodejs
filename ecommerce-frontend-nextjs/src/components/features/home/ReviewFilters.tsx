import { X } from "lucide-react";

interface ReviewFiltersProps {
  filterRating: string;
  onFilterChange: (rating: string) => void;
  sortBy: "created_at" | "rating" | "helpful_count";
  onSortChange: (sort: "created_at" | "rating" | "helpful_count") => void;
  currentUser?: any;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

export function ReviewFilters({
  filterRating,
  onFilterChange,
  sortBy,
  onSortChange,
  currentUser,
  statusFilter,
  onStatusFilterChange,
}: ReviewFiltersProps) {
  console.log("Current User in ReviewFilters:", currentUser);
  console.log("Current User Role:", currentUser?.role);
  console.log("Status Filter:", statusFilter);
  console.log("onStatusFilterChange:", onStatusFilterChange);

  const isAdmin = currentUser?.role === 1;

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Clear Rating Filter */}
        {filterRating && (
          <button
            onClick={() => onFilterChange("")}
            className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors"
          >
            <span>{filterRating} stars</span>
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Admin Status Filter */}
        {isAdmin && onStatusFilterChange && (
          <select
            value={statusFilter || ""}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        )}
      </div>

      {/* Sort Dropdown */}
      <select
        value={sortBy}
        onChange={(e) =>
          onSortChange(
            e.target.value as "created_at" | "rating" | "helpful_count"
          )
        }
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
      >
        <option value="created_at">Newest</option>
        <option value="rating">Highest rating</option>
        <option value="helpful_count">Most helpful</option>
      </select>
    </div>
  );
}
