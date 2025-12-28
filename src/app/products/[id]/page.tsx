import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SalesChart } from '@/features/products/components/SalesChart';
import { ProductDetailSkeleton } from '@/components/ui/LoadingSkeletons';
import { getProductService, getSalesService } from '@/services';
import { formatCurrency } from '@/lib/utils';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  const productService = getProductService();
  const result = await productService.getProductById(Number(id));

  if (!result.success) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${result.data.title} | Product Analytics Dashboard`,
    description: result.data.description,
  };
}

async function ProductDetailContent({ id }: { id: number }) {
  const productService = getProductService();
  const salesService = getSalesService();

  const [productResult, salesResult] = await Promise.all([
    productService.getProductById(id),
    salesService.getProductSalesMetrics(id),
  ]);

  if (!productResult.success) {
    notFound();
  }

  if (!salesResult.success) {
    throw new Error(salesResult.error.message);
  }

  const product = productResult.data;
  const salesMetrics = salesResult.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/products"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            <div className="relative h-96 bg-muted rounded-lg">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-contain p-8"
                priority
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-3">
              <Package className="h-3 w-3 mr-1" />
              {product.category}
            </Badge>
            <h1 className="text-4xl font-bold mb-4">{product.title}</h1>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={`star-${product.id}-${i}`}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating.rate)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating.rate} ({product.rating.count} reviews)
                </span>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button size="lg" className="flex-1">
              Add to Cart
            </Button>
            <Button size="lg" variant="outline">
              Add to Wishlist
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">Sales Analytics</h2>
        <SalesChart salesMetrics={salesMetrics} />
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId) || productId <= 0) {
    notFound();
  }

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent id={productId} />
    </Suspense>
  );
}
