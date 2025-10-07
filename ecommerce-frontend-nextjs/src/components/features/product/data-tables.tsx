"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RotateCcw,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import ProductAdd from "./ProductAdd";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  // Additional filter props
  availabilityFilter?: boolean | null;
  setAvailabilityFilter?: (value: boolean | null) => void;
  brandFilter?: string;
  setBrandFilter?: (value: string) => void;
  categoryFilter?: string;
  setCategoryFilter?: (value: string) => void;
  sortBy?: string;
  setSortBy?: (value: string) => void;
  order?: "asc" | "desc";
  setOrder?: (value: "asc" | "desc") => void;
  // Options for dropdowns
  brands?: Array<{ _id: string; name: string }>;
  categories?: Array<{ _id: string; name: string }>;
}

export function ProductDataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination,
  setPagination,
  searchQuery,
  setSearchQuery,
  onRefresh,
  isLoading,
  availabilityFilter,
  setAvailabilityFilter,
  brandFilter,
  setBrandFilter,
  categoryFilter,
  setCategoryFilter,
  sortBy,
  setSortBy,
  order,
  setOrder,
  brands = [],
  categories = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [brandOpen, setBrandOpen] = React.useState(false);
  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const [brandSearch, setBrandSearch] = React.useState("");
  const [categorySearch, setCategorySearch] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: pageCount,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  });

  // Helper function to clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setAvailabilityFilter?.(null);
    setBrandFilter?.("");
    setCategoryFilter?.("");
    setSortBy?.("created_at");
    setOrder?.("desc");
  };

  // Count active filters
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (availabilityFilter !== null && availabilityFilter !== undefined)
      count++;
    if (brandFilter) count++;
    if (categoryFilter) count++;
    return count;
  }, [searchQuery, availabilityFilter, brandFilter, categoryFilter]);

  // Get brand name by ID
  const getBrandName = (brandId: string) => {
    return brands.find((b) => b._id === brandId)?.name || brandId;
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c._id === categoryId)?.name || categoryId;
  };

  // Filter brands based on search
  const filteredBrands = React.useMemo(() => {
    if (!brandSearch) return brands;
    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [brands, brandSearch]);

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Handle column header click for sorting
  const handleSort = (columnId: string) => {
    // Map column IDs to API sort fields
    const sortFieldMap: Record<string, string> = {
      name: "name",
      created_at: "created_at",
      price_range: "price",
      rating: "rating",
    };

    const apiSortField = sortFieldMap[columnId];
    if (!apiSortField) return;

    if (sortBy === apiSortField) {
      // Toggle order if same column
      setOrder?.(order === "asc" ? "desc" : "asc");
    } else {
      // Set new sort column with default desc order
      setSortBy?.(apiSortField);
      setOrder?.("desc");
    }
  };

  // Get sort icon for column
  const getSortIcon = (columnId: string) => {
    const sortFieldMap: Record<string, string> = {
      name: "name",
      created_at: "created_at",
      price_range: "price",
      rating: "rating",
    };

    const apiSortField = sortFieldMap[columnId];
    if (!apiSortField) return null;

    if (sortBy === apiSortField) {
      return order === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ArrowDown className="ml-2 h-4 w-4" />
      );
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex justify-between items-center py-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search product name..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          {/* Brand Filter with Autocomplete */}
          <Popover open={brandOpen} onOpenChange={setBrandOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-between">
                {brandFilter ? getBrandName(brandFilter) : "Select brand..."}
                {brandFilter ? (
                  <X
                    className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBrandFilter?.("");
                    }}
                  />
                ) : (
                  <Filter className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search brand..."
                  value={brandSearch}
                  onValueChange={setBrandSearch}
                />
                <CommandList>
                  <CommandEmpty>No brand found.</CommandEmpty>
                  <CommandGroup>
                    {filteredBrands.map((brand) => (
                      <CommandItem
                        key={brand._id}
                        value={brand.name}
                        onSelect={() => {
                          setBrandFilter?.(brand._id);
                          setBrandOpen(false);
                          setBrandSearch("");
                        }}
                      >
                        {brand.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Category Filter with Autocomplete */}
          <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-between">
                {categoryFilter
                  ? getCategoryName(categoryFilter)
                  : "Select category..."}
                {categoryFilter ? (
                  <X
                    className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCategoryFilter?.("");
                    }}
                  />
                ) : (
                  <Filter className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search category..."
                  value={categorySearch}
                  onValueChange={setCategorySearch}
                />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    {filteredCategories.map((category) => (
                      <CommandItem
                        key={category._id}
                        value={category.name}
                        onSelect={() => {
                          setCategoryFilter?.(category._id);
                          setCategoryOpen(false);
                          setCategorySearch("");
                        }}
                      >
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Additional Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Availability Filter */}
              <div className="px-2 py-2">
                <label className="text-sm font-medium">Availability</label>
                <Select
                  value={
                    availabilityFilter == null
                      ? "all"
                      : availabilityFilter.toString()
                  }
                  onValueChange={(value) => {
                    if (setAvailabilityFilter) {
                      setAvailabilityFilter(
                        value === "all" ? null : value === "true"
                      );
                    }
                  }}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="true">Available Only</SelectItem>
                    <SelectItem value="false">Unavailable Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DropdownMenuSeparator />

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <DropdownMenuItem onClick={clearAllFilters}>
                  Clear all filters
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          <ProductAdd />

          <Button
            disabled={isLoading}
            className="bg-blue-400 hover:bg-blue-500"
            onClick={onRefresh}
          >
            <RotateCcw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 py-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {`"${searchQuery}"`}
              <button
                onClick={() => setSearchQuery("")}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </Badge>
          )}

          {brandFilter && (
            <Badge variant="secondary" className="gap-1">
              Brand: {getBrandName(brandFilter)}
              <button
                onClick={() => setBrandFilter?.("")}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </Badge>
          )}

          {categoryFilter && (
            <Badge variant="secondary" className="gap-1">
              Category: {getCategoryName(categoryFilter)}
              <button
                onClick={() => setCategoryFilter?.("")}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </Badge>
          )}

          {availabilityFilter !== null && availabilityFilter !== undefined && (
            <Badge variant="secondary" className="gap-1">
              {availabilityFilter ? "Available" : "Unavailable"}
              <button
                onClick={() => setAvailabilityFilter?.(null)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full w-4 h-4 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          [
                            "name",
                            "created_at",
                            "price_range",
                            "rating",
                          ].includes(header.id)
                            ? "flex items-center cursor-pointer hover:text-primary select-none"
                            : ""
                        }
                        onClick={() => {
                          if (
                            [
                              "name",
                              "created_at",
                              "price_range",
                              "rating",
                            ].includes(header.id)
                          ) {
                            handleSort(header.id);
                          }
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {[
                          "name",
                          "created_at",
                          "price_range",
                          "rating",
                        ].includes(header.id) && getSortIcon(header.id)}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    Loading products...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="space-y-2">
                    <div>No products found.</div>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-xs"
                      >
                        Clear filters to see all products
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getRowCount()} row(s) selected.
        </div>
        <div className="flex items-center gap-6 lg:gap-8">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.firstPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronFirstIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.lastPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronLastIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
