'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { ProductFilters, ProductSort } from '@/models/Product';

interface ProductFiltersBarProps {
  filters: ProductFilters;
  sort: ProductSort;
  categories: ReadonlyArray<string>;
  onFilterChange: (
    key: keyof ProductFilters,
    value: string | number | undefined
  ) => void;
  onSortChange: (field: ProductSort['field']) => void;
  onReset: () => void;
}

/**
 * ProductFiltersBar - Controlled component for filtering and sorting
 * Single Responsibility: Manage filter UI and emit changes
 */
export function ProductFiltersBar({
  filters,
  sort,
  categories,
  onFilterChange,
  onSortChange,
  onReset,
}: ProductFiltersBarProps) {
  return (
    <div className="space-y-4 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={filters.category || ''}
          onChange={(e) =>
            onFilterChange('category', e.target.value || undefined)
          }
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </Select>

        <Select
          value={sort.field}
          onChange={(e) => onSortChange(e.target.value as ProductSort['field'])}
        >
          <option value="title">Sort by Name</option>
          <option value="price">Sort by Price</option>
          <option value="rating">Sort by Rating</option>
        </Select>

        <Button variant="outline" onClick={onReset}>
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
        <Input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice || ''}
          onChange={(e) =>
            onFilterChange(
              'minPrice',
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          min="0"
          step="0.01"
        />
        <Input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice || ''}
          onChange={(e) =>
            onFilterChange(
              'maxPrice',
              e.target.value ? Number(e.target.value) : undefined
            )
          }
          min="0"
          step="0.01"
        />
      </div>

      {(filters.category ||
        filters.search ||
        filters.minPrice ||
        filters.maxPrice) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.category && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onFilterChange('category', undefined)}
            >
              Category: {filters.category} ✕
            </Button>
          )}
          {filters.search && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onFilterChange('search', undefined)}
            >
              Search: {filters.search} ✕
            </Button>
          )}
          {filters.minPrice !== undefined && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onFilterChange('minPrice', undefined)}
            >
              Min: ${filters.minPrice} ✕
            </Button>
          )}
          {filters.maxPrice !== undefined && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onFilterChange('maxPrice', undefined)}
            >
              Max: ${filters.maxPrice} ✕
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
