import { Suspense } from 'react';
import { ProductList } from '@/features/products/components/ProductList';
import { ProductCardSkeleton } from '@/components/ui/LoadingSkeletons';
import { getProductService } from '@/services';

/**
 * Products Page - Server Component
 * Fetches data on server, passes to client components
 * Demonstrates SSR and proper component architecture
 */
export const metadata = {
  title: 'Products | Product Analytics Dashboard',
  description: 'Browse and filter products with advanced analytics',
};

async function ProductsContent() {
  const productService = getProductService();

  const productsResult = await productService.getProducts();
  const categoriesResult = await productService.getCategories();

  if (!productsResult.success) {
    throw new Error(productsResult.error.message);
  }

  if (!categoriesResult.success) {
    throw new Error(categoriesResult.error.message);
  }

  return (
    <ProductList
      initialProducts={productsResult.data.data}
      categories={categoriesResult.data}
    />
  );
}

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Products</h1>
        <p className="text-muted-foreground">
          Browse our collection of products with advanced filtering and sorting
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        }
      >
        <ProductsContent />
      </Suspense>
    </div>
  );
}
