import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
      <p className="text-muted-foreground mb-8">
        The product you&apos;re looking for doesn&apos;t exist or has been
        removed.
      </p>
      <Link href="/products">
        <Button>Back to Products</Button>
      </Link>
    </div>
  );
}
