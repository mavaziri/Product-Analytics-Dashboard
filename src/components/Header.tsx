import Link from 'next/link';
import { Package } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link
          href="/products"
          className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
        >
          <Package className="h-6 w-6" />
          <span className="font-bold text-xl">Product Analytics</span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link
            href="/products"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Products
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
