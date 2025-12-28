'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Product } from '@/models/Product';
import { formatCurrency, truncateText } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard - Presentational component
 * Single Responsibility: Display product information
 */
export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="block group">
      <Card className="overflow-hidden h-full transition-all hover:shadow-lg hover:scale-[1.02]">
        <div className="relative h-48 bg-muted">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {truncateText(product.title, 60)}
            </CardTitle>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating.rate}</span>
              <span className="text-xs text-muted-foreground">
                ({product.rating.count})
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="mb-2">
            {product.category}
          </Badge>
          <CardDescription className="line-clamp-2">
            {product.description}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
