import { FetchHttpClient } from '@/lib/httpClient';
import { ProductRepository } from '@/services/repositories/ProductRepository';
import { ProductService } from '@/services/ProductService';
import { SalesService } from '@/services/SalesService';

/**
 * Service Factory - Dependency Injection Container
 * Single instance creation and dependency management
 * Following Dependency Inversion and Single Responsibility principles
 */

const API_BASE_URL = 'https://fakestoreapi.com';

// Create singleton instances
const httpClient = new FetchHttpClient(API_BASE_URL);
const productRepository = new ProductRepository(httpClient);
const productService = new ProductService(productRepository);
const salesService = new SalesService();

/**
 * Factory functions to get service instances
 */
export const getProductService = () => productService;
export const getSalesService = () => salesService;

// For testing purposes
export const createProductService = () => {
  const client = new FetchHttpClient(API_BASE_URL);
  const repository = new ProductRepository(client);

  return new ProductService(repository);
};

export const createSalesService = () => {
  return new SalesService();
};
