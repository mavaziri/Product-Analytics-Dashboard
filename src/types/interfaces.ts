import type {
  Product,
  ProductFilters,
  ProductSort,
  Pagination,
  PaginatedResult,
  ProductSalesMetrics,
} from '@/models/Product';
import type { Result } from '@/models/Common';

/**
 * Repository Interface - Abstract data access layer
 * Following Repository Pattern and Dependency Inversion Principle
 */
export interface IProductRepository {
  findAll(): Promise<Result<ReadonlyArray<Product>>>;
  findById(id: number): Promise<Result<Product>>;
  findByCategory(category: string): Promise<Result<ReadonlyArray<Product>>>;
  getAllCategories(): Promise<Result<ReadonlyArray<string>>>;
}

/**
 * Service Interface - Abstract business logic layer
 * Following Interface Segregation Principle
 */
export interface IProductService {
  getProducts(
    filters?: ProductFilters,
    sort?: ProductSort,
    pagination?: Pagination
  ): Promise<Result<PaginatedResult<Product>>>;

  getProductById(id: number): Promise<Result<Product>>;

  getCategories(): Promise<Result<ReadonlyArray<string>>>;

  searchProducts(query: string): Promise<Result<ReadonlyArray<Product>>>;
}

/**
 * Sales Service Interface - Separate concern for sales analytics
 */
export interface ISalesService {
  getProductSalesMetrics(
    productId: number
  ): Promise<Result<ProductSalesMetrics>>;

  generateMockSalesData(productId: number): ProductSalesMetrics;
}
