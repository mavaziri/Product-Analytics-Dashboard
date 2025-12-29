export interface Product {
  readonly id: number;
  readonly title: string;
  readonly price: number;
  readonly description: string;
  readonly category: string;
  readonly image: string;
  readonly rating: ProductRating;
}

export interface ProductRating {
  readonly rate: number;
  readonly count: number;
}

export interface ProductFilters {
  readonly category?: string;
  readonly search?: string;
  readonly minPrice?: number;
  readonly maxPrice?: number;
}

export type SortField = 'title' | 'price' | 'rating';

export type SortOrder = 'asc' | 'desc';

export interface ProductSort {
  readonly field: SortField;
  readonly order: SortOrder;
}

export interface Pagination {
  readonly page: number;
  readonly limit: number;
}

export interface PaginatedResult<T> {
  readonly data: ReadonlyArray<T>;
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export interface MonthlySalesData {
  readonly month: string;
  readonly sales: number;
  readonly revenue: number;
  readonly units: number;
}

export interface ProductSalesMetrics {
  readonly productId: number;
  readonly monthlySales: ReadonlyArray<MonthlySalesData>;
  readonly totalRevenue: number;
  readonly totalUnits: number;
  readonly averageMonthlySales: number;
}
