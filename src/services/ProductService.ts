import type { IProductService, IProductRepository } from '@/types/interfaces';
import type {
  Product,
  ProductFilters,
  ProductSort,
  Pagination,
  PaginatedResult,
} from '@/models/Product';
import type { Result } from '@/models/Common';
import { success, failure } from '@/models/Common';

/**
 * ProductService - Business logic layer
 * Single Responsibility: Implement product-related business logic
 * Open/Closed: Can be extended without modifying existing code
 * Depends on IProductRepository abstraction (Dependency Inversion)
 */
export class ProductService implements IProductService {
  constructor(private readonly repository: IProductRepository) {}

  async getProducts(
    filters?: ProductFilters,
    sort?: ProductSort,
    pagination?: Pagination
  ): Promise<Result<PaginatedResult<Product>>> {
    const productsResult = await this.repository.findAll();

    if (!productsResult.success) {
      return productsResult;
    }

    let products = [...productsResult.data];

    if (filters) {
      products = this.applyFilters(products, filters);
    }

    if (sort) {
      products = this.applySort(products, sort);
    }

    const paginationConfig = pagination || { page: 1, limit: 20 };
    const paginatedResult = this.applyPagination(products, paginationConfig);

    return success(paginatedResult);
  }

  async getProductById(id: number): Promise<Result<Product>> {
    return this.repository.findById(id);
  }

  async getCategories(): Promise<Result<ReadonlyArray<string>>> {
    return this.repository.getAllCategories();
  }

  async searchProducts(query: string): Promise<Result<ReadonlyArray<Product>>> {
    if (!query || query.trim() === '') {
      return failure({
        message: 'Search query cannot be empty',
        code: 'INVALID_QUERY',
      });
    }

    const productsResult = await this.repository.findAll();

    if (!productsResult.success) {
      return productsResult;
    }

    const normalizedQuery = query.toLowerCase().trim();

    const filtered = productsResult.data.filter(
      (product) =>
        product.title.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery)
    );

    return success(filtered);
  }

  private applyFilters(
    products: ReadonlyArray<Product>,
    filters: ProductFilters
  ): Product[] {
    return products.filter((product) => {
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      if (filters.search) {
        const query = filters.search.toLowerCase();

        const matchesSearch =
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query);
        if (!matchesSearch) {
          return false;
        }
      }

      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }

      return true;
    });
  }

  private applySort(
    products: ReadonlyArray<Product>,
    sort: ProductSort
  ): Product[] {
    const sorted = [...products];

    sorted.sort((a, b) => {
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

    return sorted;
  }

  private applyPagination(
    products: ReadonlyArray<Product>,
    pagination: Pagination
  ): PaginatedResult<Product> {
    const { page, limit } = pagination;

    const total = products.length;
    const totalPages = Math.ceil(total / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const data = products.slice(startIndex, endIndex);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
