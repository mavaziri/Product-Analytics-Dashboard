'use client';

import { ProductCard } from './ProductCard';
import { ProductFiltersBar } from './ProductFiltersBar';
import { Pagination } from './Pagination';
import { useProductFilters } from '../hooks/useProductFilters';

import type { Product } from '@/models/Product';

interface ProductListProps {
  initialProducts: ReadonlyArray<Product>;
  categories: ReadonlyArray<string>;
}

/**
 * ProductList - Smart component orchestrating product display
 * Manages state via custom hook, delegates rendering to presentational components
 */
export function ProductList({ initialProducts, categories }: ProductListProps) {
  const {
    filteredProducts,
    filters,
    sort,
    pagination,
    totalPages,
    updateFilter,
    updateSort,
    setPage,
    resetFilters,
  } = useProductFilters({ initialProducts });

  return (
    <div>
      <ProductFiltersBar
        filters={filters}
        sort={sort}
        categories={categories}
        onFilterChange={updateFilter}
        onSortChange={updateSort}
        onReset={resetFilters}
      />

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No products found matching your criteria.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
