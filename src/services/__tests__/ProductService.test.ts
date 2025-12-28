import { ProductService } from '../ProductService';
import type { IProductRepository } from '../../types/interfaces';
import type { Product } from '../../models/Product';
import { success } from '../../models/Common';

const mockProducts: Product[] = [
  {
    id: 1,
    title: 'Laptop',
    price: 999,
    description: 'High-performance laptop',
    category: 'electronics',
    image: 'https://example.com/laptop.jpg',
    rating: { rate: 4.5, count: 100 },
  },
  {
    id: 2,
    title: 'Phone',
    price: 699,
    description: 'Smartphone with advanced features',
    category: 'electronics',
    image: 'https://example.com/phone.jpg',
    rating: { rate: 4.2, count: 200 },
  },
  {
    id: 3,
    title: 'T-Shirt',
    price: 29,
    description: 'Cotton t-shirt',
    category: 'clothing',
    image: 'https://example.com/tshirt.jpg',
    rating: { rate: 4.0, count: 50 },
  },
  {
    id: 4,
    title: 'Jeans',
    price: 79,
    description: 'Denim jeans',
    category: 'clothing',
    image: 'https://example.com/jeans.jpg',
    rating: { rate: 4.3, count: 80 },
  },
];

class MockProductRepository implements IProductRepository {
  async findAll() {
    return success(mockProducts);
  }

  async findById(id: number) {
    const product = mockProducts.find((product: Product) => product.id === id);
    if (!product) {
      return {
        success: false as const,
        error: { message: 'Product not found', code: 'NOT_FOUND' },
      };
    }

    return success(product);
  }

  async findByCategory(category: string) {
    const filtered = mockProducts.filter(
      (product: Product) => product.category === category
    );

    return success(filtered);
  }

  async getAllCategories() {
    const categories = Array.from(
      new Set(mockProducts.map((product: Product) => product.category))
    );

    return success(categories);
  }
}

describe('ProductService', () => {
  let productService: ProductService;
  let mockRepository: MockProductRepository;

  beforeEach(() => {
    mockRepository = new MockProductRepository();
    productService = new ProductService(mockRepository);
  });

  describe('getProducts', () => {
    it('should return all products without filters', async () => {
      const result = await productService.getProducts();

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.data).toHaveLength(4);
        expect(result.data.total).toBe(4);
      }
    });

    it('should filter products by category', async () => {
      const result = await productService.getProducts({
        category: 'electronics',
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.data).toHaveLength(2);

        expect(
          result.data.data.every(
            (product: Product) => product.category === 'electronics'
          )
        ).toBe(true);
      }
    });

    it('should filter products by search query', async () => {
      const result = await productService.getProducts({
        search: 'laptop',
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.data).toHaveLength(1);

        expect(result.data.data[0]?.title).toBe('Laptop');
      }
    });

    it('should filter products by price range', async () => {
      const result = await productService.getProducts({
        minPrice: 50,
        maxPrice: 800,
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.data).toHaveLength(2);

        expect(
          result.data.data.every(
            (p: Product) => p.price >= 50 && p.price <= 800
          )
        ).toBe(true);
      }
    });

    it('should sort products by price ascending', async () => {
      const result = await productService.getProducts(undefined, {
        field: 'price',
        order: 'asc',
      });

      expect(result.success).toBe(true);

      if (result.success) {
        const prices = result.data.data.map((p: Product) => p.price);
        expect(prices).toEqual([29, 79, 699, 999]);
      }
    });

    it('should sort products by price descending', async () => {
      const result = await productService.getProducts(undefined, {
        field: 'price',
        order: 'desc',
      });

      expect(result.success).toBe(true);

      if (result.success) {
        const prices = result.data.data.map(
          (product: Product) => product.price
        );

        expect(prices).toEqual([999, 699, 79, 29]);
      }
    });

    it('should sort products by title', async () => {
      const result = await productService.getProducts(undefined, {
        field: 'title',
        order: 'asc',
      });

      expect(result.success).toBe(true);

      if (result.success) {
        const titles = result.data.data.map(
          (product: Product) => product.title
        );
        expect(titles).toEqual(['Jeans', 'Laptop', 'Phone', 'T-Shirt']);
      }
    });

    it('should paginate products correctly', async () => {
      const result = await productService.getProducts(undefined, undefined, {
        page: 1,
        limit: 2,
      });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.data).toHaveLength(2);

        expect(result.data.page).toBe(1);

        expect(result.data.limit).toBe(2);

        expect(result.data.totalPages).toBe(2);
      }
    });

    it('should return second page of products', async () => {
      const result = await productService.getProducts(undefined, undefined, {
        page: 2,
        limit: 2,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data).toHaveLength(2);

        expect(result.data.page).toBe(2);
      }
    });

    it('should combine filters, sorting, and pagination', async () => {
      const result = await productService.getProducts(
        { category: 'electronics' },
        { field: 'price', order: 'desc' },
        { page: 1, limit: 1 }
      );

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.data).toHaveLength(1);

        expect(result.data.data[0]?.title).toBe('Laptop');

        expect(result.data.data[0]?.price).toBe(999);
      }
    });
  });

  describe('getProductById', () => {
    it('should return a product by id', async () => {
      const result = await productService.getProductById(1);

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.id).toBe(1);

        expect(result.data.title).toBe('Laptop');
      }
    });

    it('should return error for non-existent product', async () => {
      const result = await productService.getProductById(999);

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', async () => {
      const result = await productService.searchProducts('phone');

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toHaveLength(1);

        expect(result.data[0]?.title).toBe('Phone');
      }
    });

    it('should return error for empty search query', async () => {
      const result = await productService.searchProducts('');

      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.code).toBe('INVALID_QUERY');
      }
    });

    it('should search case-insensitively', async () => {
      const result = await productService.searchProducts('LAPTOP');

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toHaveLength(1);

        expect(result.data[0]?.title).toBe('Laptop');
      }
    });

    it('should search in description', async () => {
      const result = await productService.searchProducts('cotton');

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toHaveLength(1);

        expect(result.data[0]?.title).toBe('T-Shirt');
      }
    });
  });

  describe('getCategories', () => {
    it('should return all unique categories', async () => {
      const result = await productService.getCategories();

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data).toHaveLength(2);

        expect(result.data).toContain('electronics');

        expect(result.data).toContain('clothing');
      }
    });
  });
});
