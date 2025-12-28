import type { IProductRepository } from '@/types/interfaces';
import type { Product } from '@/models/Product';
import type { Result, HttpClient } from '@/models/Common';
import { failure } from '@/models/Common';

/**
 * ProductRepository - Concrete implementation of data access layer
 * Single Responsibility: Handle all product data fetching from API
 * Depends on abstraction (HttpClient) not concrete implementation
 */
export class ProductRepository implements IProductRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async findAll(): Promise<Result<ReadonlyArray<Product>>> {
    return this.httpClient.get<ReadonlyArray<Product>>('/products', {
      cache: 'force-cache',
      next: { revalidate: 3600 },
    });
  }

  async findById(id: number): Promise<Result<Product>> {
    if (id <= 0) {
      return failure({
        message: 'Invalid product ID',
        code: 'INVALID_ID',
      });
    }

    return this.httpClient.get<Product>(`/products/${id}`, {
      cache: 'force-cache',
      next: { revalidate: 3600 },
    });
  }

  async findByCategory(
    category: string
  ): Promise<Result<ReadonlyArray<Product>>> {
    if (!category || category.trim() === '') {
      return failure({
        message: 'Category cannot be empty',
        code: 'INVALID_CATEGORY',
      });
    }

    return this.httpClient.get<ReadonlyArray<Product>>(
      `/products/category/${encodeURIComponent(category)}`,
      {
        cache: 'force-cache',
        next: { revalidate: 3600 },
      }
    );
  }

  async getAllCategories(): Promise<Result<ReadonlyArray<string>>> {
    return this.httpClient.get<ReadonlyArray<string>>('/products/categories', {
      cache: 'force-cache',
      next: { revalidate: 3600 },
    });
  }
}
