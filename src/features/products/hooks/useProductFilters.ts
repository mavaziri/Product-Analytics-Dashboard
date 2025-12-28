'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  Product,
  ProductFilters,
  ProductSort,
  Pagination,
} from '@/models/Product';

interface UseProductFiltersProps {
  initialProducts: ReadonlyArray<Product>;
}

interface ProductFiltersResult {
  filteredProducts: ReadonlyArray<Product>;
  filters: ProductFilters;
  sort: ProductSort;
  pagination: Pagination;
  totalPages: number;
  updateFilter: (
    key: keyof ProductFilters,
    value: string | number | undefined
  ) => void;
  updateSort: (field: ProductSort['field']) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

/**
 * Custom hook for managing product filtering, sorting, and pagination
 * Encapsulates complex state logic following Single Responsibility Principle
 */
export function useProductFilters({
  initialProducts,
}: UseProductFiltersProps): ProductFiltersResult {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sort, setSort] = useState<ProductSort>({
    field: 'title',
    order: 'asc',
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
  });

  const updateFilter = useCallback(
    (key: keyof ProductFilters, value: string | number | undefined) => {
      setFilters((prev) => {
        if (value === undefined || value === '') {
          const { [key]: _, ...rest } = prev;

          return rest;
        }

        return { ...prev, [key]: value };
      });

      setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    },
    []
  );

  const updateSort = useCallback((field: ProductSort['field']) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});

    setSort({ field: 'title', order: 'asc' });

    setPagination({ page: 1, limit: 12 });
  }, []);

  const filteredProducts = useMemo(() => {
    let products = [...initialProducts];

    // Apply filters
    if (filters.category) {
      products = products.filter((p) => p.category === filters.category);
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (filters.minPrice !== undefined) {
      products = products.filter((p) => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= filters.maxPrice!);
    }

    // Apply sorting
    products.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = a.rating.rate - b.rating.rate;
          break;
      }

      return sort.order === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const startIndex = (pagination.page - 1) * pagination.limit;

    return products.slice(startIndex, startIndex + pagination.limit);
  }, [initialProducts, filters, sort, pagination]);

  const totalPages = useMemo(() => {
    let count = initialProducts.length;

    // Apply filter count
    if (
      filters.category ||
      filters.search ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined
    ) {
      let products = [...initialProducts];

      if (filters.category) {
        products = products.filter((p) => p.category === filters.category);
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();
        products = products.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
      }

      if (filters.minPrice !== undefined) {
        products = products.filter((p) => p.price >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        products = products.filter((p) => p.price <= filters.maxPrice!);
      }

      count = products.length;
    }

    return Math.ceil(count / pagination.limit);
  }, [initialProducts, filters, pagination.limit]);

  return {
    filteredProducts,
    filters,
    sort,
    pagination,
    totalPages,
    updateFilter,
    updateSort,
    setPage,
    resetFilters,
  };
}
