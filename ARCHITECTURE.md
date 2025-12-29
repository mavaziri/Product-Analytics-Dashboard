# Architecture Documentation

## Overview

This document explains the architectural decisions, design patterns, and implementation details of the Product Analytics Dashboard. The project demonstrates enterprise-grade code organization, SOLID principles, and modern Next.js best practices.

## Project Requirements Coverage

This architecture fulfills all technical requirements:

### ✅ Architecture & Design (35%)

- Clear folder structure with separation of concerns
- Service layer abstraction with dependency injection
- Repository pattern for data access
- SOLID principles throughout
- Domain models and type safety

### ✅ Next.js Expertise (25%)

- Next.js 15 App Router
- Server Components for data fetching
- Client Components for interactivity
- Server Actions for mutations
- SSR/SSG with proper caching
- Dynamic routing and metadata

### ✅ Code Quality (20%)

- TypeScript strict mode (no `any` types)
- Unit tests with Jest
- Proper error handling
- Clear naming conventions
- Reusable components and hooks

### ✅ UI/UX & Functionality (10%)

- Responsive design with Tailwind CSS
- Interactive charts (Recharts)
- Filtering, sorting, pagination
- Skeleton loaders and dark mode

### ✅ Performance & Scalability (10%)

- Server Components reduce bundle size
- Memoization for expensive operations
- Efficient data handling
- Proper component boundaries

## Core Principles

### 1. Clean Architecture

The project follows Clean Architecture principles to achieve:

- **Independence from frameworks**: Business logic doesn't depend on Next.js
- **Testability**: Business rules can be tested without UI, database, or external dependencies
- **Independence from UI**: UI can change without affecting business logic
- **Independence from data sources**: Can swap FakeStore API with any other data source

### 2. Separation of Concerns

Each layer has a specific responsibility:

```
┌─────────────────────────────────────────┐
│        Presentation Layer               │
│  (App Router, Components, Features)     │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        Business Logic Layer             │
│       (Services, Domain Models)         │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        Data Access Layer                │
│      (Repositories, HTTP Client)        │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           External APIs                 │
│        (FakeStore API)                  │
└─────────────────────────────────────────┘
```

## Layer Details

### Presentation Layer

**Location**: `app/`, `components/`, `features/`

**Responsibilities**:

- Render UI components
- Handle user interactions
- Display data
- Route navigation

**Components**:

- **Server Components**: Fetch data, render initial HTML
- **Client Components**: Handle interactivity, client-side state
- **Hybrid approach**: Server Components pass data to Client Components

**Example Flow**:

```typescript
// Server Component (app/products/page.tsx)
async function ProductsContent() {
  const productService = getProductService();
  const result = await productService.getProducts();

  return <ProductList initialProducts={result.data.data} />;
}

// Client Component (features/products/components/ProductList.tsx)
('use client');
export function ProductList({ initialProducts }) {
  const { filteredProducts } = useProductFilters({ initialProducts });

  return (
    <div>
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Business Logic Layer

**Location**: `services/`, `models/`

**Responsibilities**:

- Implement business rules
- Data validation
- Filtering, sorting, pagination logic
- Domain model definitions

**Key Classes**:

1. **ProductService**: Product-related business logic

   ```typescript
   class ProductService implements IProductService {
     async getProducts(filters?, sort?, pagination?) {
       // 1. Fetch from repository
       // 2. Apply filters
       // 3. Apply sorting
       // 4. Apply pagination
       // 5. Return Result<PaginatedResult<Product>>
     }
   }
   ```

2. **SalesService**: Sales analytics business logic
   ```typescript
   class SalesService implements ISalesService {
     async getProductSalesMetrics(productId) {
       // Generate or fetch sales data
       // Calculate totals and averages
       // Return Result<ProductSalesMetrics>
     }
   }
   ```

**Domain Models**:

- `Product`: Core product entity
- `ProductSalesMetrics`: Sales analytics data
- `ProductFilters`, `ProductSort`, `Pagination`: Value objects

### Data Access Layer

**Location**: `services/repositories/`, `lib/httpClient.ts`

**Responsibilities**:

- Fetch data from external sources
- Transform API responses to domain models
- Handle network errors
- Caching strategies

**Key Classes**:

1. **ProductRepository**: Data access for products

   ```typescript
   class ProductRepository implements IProductRepository {
     async findAll(): Promise<Result<Product[]>> {
       return this.httpClient.get<Product[]>('/products', {
         cache: 'force-cache',
         next: { revalidate: 3600 },
       });
     }
   }
   ```

2. **FetchHttpClient**: HTTP client abstraction
   ```typescript
   class FetchHttpClient implements HttpClient {
     async get<T>(url, config?): Promise<Result<T>> {
       try {
         const response = await fetch(url, config);
         // Handle response
         return success(data);
       } catch (error) {
         return failure(error);
       }
     }
   }
   ```

## Design Patterns

### 1. Repository Pattern

**Purpose**: Abstract data access logic from business logic

**Implementation**:

```typescript
interface IProductRepository {
  findAll(): Promise<Result<Product[]>>;
  findById(id: number): Promise<Result<Product>>;
  findByCategory(category: string): Promise<Result<Product[]>>;
}

class ProductRepository implements IProductRepository {
  constructor(private httpClient: HttpClient) {}

  async findAll() {
    return this.httpClient.get<Product[]>('/products');
  }
}
```

**Benefits**:

- Easy to swap data sources
- Easy to mock for testing
- Centralized data access logic

### 2. Service Layer Pattern

**Purpose**: Encapsulate business logic separate from presentation and data access

**Implementation**:

```typescript
interface IProductService {
  getProducts(
    filters?,
    sort?,
    pagination?
  ): Promise<Result<PaginatedResult<Product>>>;
}

class ProductService implements IProductService {
  constructor(private repository: IProductRepository) {}

  async getProducts(filters?, sort?, pagination?) {
    const products = await this.repository.findAll();
    // Apply business logic
    return result;
  }
}
```

**Benefits**:

- Reusable business logic
- Testable without UI
- Single source of truth for business rules

### 3. Result Pattern

**Purpose**: Type-safe error handling without throwing exceptions

**Implementation**:

```typescript
type Result<T, E = Error> = Success<T> | Failure<E>;

interface Success<T> {
  success: true;
  data: T;
}

interface Failure<E> {
  success: false;
  error: E;
}
```

**Usage**:

```typescript
const result = await productService.getProducts();

if (result.success) {
  // TypeScript knows result.data is available
  console.log(result.data);
} else {
  // TypeScript knows result.error is available
  console.error(result.error);
}
```

**Benefits**:

- Explicit error handling
- No try-catch blocks everywhere
- Type-safe

### 4. Factory Pattern

**Purpose**: Centralized dependency creation and injection

**Implementation**:

```typescript
// services/index.ts
const httpClient = new FetchHttpClient(API_BASE_URL);
const productRepository = new ProductRepository(httpClient);
const productService = new ProductService(productRepository);

export const getProductService = () => productService;
```

**Benefits**:

- Single place to configure dependencies
- Easy to swap implementations
- Simplified testing

### 5. Provider Pattern

**Purpose**: Share state across component tree without prop drilling

**Implementation**:

```typescript
// app/providers/ThemeProvider.tsx
'use client';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children, initialTheme }) {
  const [theme, setTheme] = useState(initialTheme);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

**Benefits**:

- Avoids prop drilling
- Centralized state management
- Easy to test

## SOLID Principles Application

### Single Responsibility Principle (SRP)

Each class/component has one reason to change:

- `ProductRepository`: Only changes if data source changes
- `ProductService`: Only changes if business rules change
- `ProductCard`: Only changes if product display changes
- `ProductFiltersBar`: Only changes if filter UI changes

### Open/Closed Principle (OCP)

Classes are open for extension, closed for modification:

```typescript
// Can add new filters without modifying ProductService
interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  // Easy to add: brand?, color?, size?
}
```

### Liskov Substitution Principle (LSP)

Implementations can be substituted for interfaces:

```typescript
// Any class implementing IProductRepository can replace ProductRepository
class ProductRepository implements IProductRepository {}
class MockProductRepository implements IProductRepository {}

// Both work with ProductService
const service = new ProductService(new ProductRepository(httpClient));
const testService = new ProductService(new MockProductRepository());
```

### Interface Segregation Principle (ISP)

Separate interfaces for different concerns:

```typescript
// Separate interfaces instead of one big interface
interface IProductService {
  /* product operations */
}
interface ISalesService {
  /* sales operations */
}

// Not: interface IService { /* everything */ }
```

### Dependency Inversion Principle (DIP)

Depend on abstractions, not implementations:

```typescript
// ProductService depends on IProductRepository interface
class ProductService {
  constructor(private repository: IProductRepository) {}
  // Not: constructor(private repository: ProductRepository)
}

// HTTP client abstraction
interface HttpClient {
  get<T>(url: string): Promise<Result<T>>;
}

class FetchHttpClient implements HttpClient {}
class AxiosHttpClient implements HttpClient {} // Easy to add
```

## Component Architecture

### Server vs Client Components

**Server Components** (default):

- Fetch data on server
- Direct database/API access
- No JavaScript sent to client
- Better performance
- Better SEO

**Client Components** (`'use client'`):

- Interactive UI
- Event handlers
- React hooks (useState, useEffect)
- Browser APIs
- Real-time updates

**Strategy**:

1. Use Server Components by default
2. Use Client Components only when needed
3. Pass data from Server to Client as props
4. Keep Client Components small and focused

### Component Hierarchy

```
Server Component (Page)
├── Server Component (Data Fetching)
│   └── Client Component (Interactive UI)
│       ├── Client Component (Form)
│       └── Client Component (Chart)
└── Server Component (Static Content)
```

## State Management Strategy

### Server State

Fetched in Server Components, passed down as props:

```typescript
// Server Component
async function Page() {
  const products = await fetchProducts(); // Server-side
  return <ProductList initialProducts={products} />;
}
```

### Client State

Managed with React hooks in Client Components:

```typescript
// Client Component
'use client';
function ProductList({ initialProducts }) {
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);
  const [filters, setFilters] = useState({});

  // State management logic
}
```

### Global State

Managed with Context API:

```typescript
// Theme state in ThemeProvider
const { theme, setTheme } = useTheme();
```

### Form State

Controlled components:

```typescript
<Input
  value={filters.search}
  onChange={(e) => updateFilter('search', e.target.value)}
/>
```

## Performance Optimizations

### 1. Memoization

```typescript
// Expensive filtering operation
const filteredProducts = useMemo(() => {
  return products.filter(/* complex logic */);
}, [products, filters]);

// Prevent function re-creation
const updateFilter = useCallback((key, value) => {
  setFilters((prev) => ({ ...prev, [key]: value }));
}, []);
```

### 2. Server Components

- Reduced JavaScript bundle
- Faster initial load
- Better SEO
- Direct data access

### 3. Code Splitting

Automatic with Next.js App Router:

- Each route is a separate chunk
- Dynamic imports for heavy components
- Lazy loading

### 4. Caching

```typescript
fetch(url, {
  cache: 'force-cache', // Cache indefinitely
  next: { revalidate: 3600 }, // Revalidate every hour
});
```

### 5. Image Optimization

```typescript
<Image
  src={product.image}
  alt={product.title}
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

## Error Handling

### Result Type Pattern

```typescript
const result = await productService.getProducts();

if (!result.success) {
  // Handle error
  throw new Error(result.error.message);
}

// Use data
const products = result.data;
```

### Error Boundaries

```typescript
// app/products/error.tsx
'use client';
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Not Found Pages

```typescript
// app/products/[id]/not-found.tsx
export default function NotFound() {
  return <div>Product not found</div>;
}
```

## Testing Strategy

The project includes comprehensive unit tests for the service layer, demonstrating test-driven development practices.

### Unit Tests with Jest

**Framework**: Jest with TypeScript support  
**Location**: [`src/services/__tests__/ProductService.test.ts`](src/services/__tests__/ProductService.test.ts)

**Test Coverage**:

- ✅ Product filtering by category, search query, and price range
- ✅ Product sorting by name, price, and rating (ascending/descending)
- ✅ Pagination logic with proper page calculations
- ✅ Combined filters, sorting, and pagination
- ✅ Error handling for invalid inputs
- ✅ Search functionality with case-insensitive matching

**Mock Strategy**:

```typescript
// Mock repository implementing the interface
class MockProductRepository implements IProductRepository {
  async findAll() {
    return success(mockProducts);
  }
  // ... other methods
}

// Test with dependency injection
const mockRepo = new MockProductRepository();
const service = new ProductService(mockRepo);
```

**Example Test**:

```typescript
describe('ProductService', () => {
  it('should filter products by category', async () => {
    const mockRepo = new MockProductRepository();
    const service = new ProductService(mockRepo);

    const result = await service.getProducts({ category: 'electronics' });

    expect(result.success).toBe(true);
    expect(result.data.data.every((p) => p.category === 'electronics')).toBe(
      true
    );
  });
});
```

### Running Tests

```bash
# Run tests in watch mode
yarn test

# Run tests once (CI mode)
yarn test:ci
```

### Why Test the Service Layer?

- Services contain core business logic
- Easy to test in isolation with mocks
- No UI dependencies
- Fast test execution
- High value for effort ratio

## Chart Implementation

The project includes rich data visualization using **Recharts** library.

### Sales Analytics Charts

**Location**: [`src/features/products/components/SalesChart.tsx`](src/features/products/components/SalesChart.tsx)

**Chart Types**:

1. **Line Chart** - Monthly Revenue Trends

   - Visualizes revenue over 12 months
   - Interactive tooltips with formatted currency
   - Responsive design
   - Custom styling for dark/light mode

2. **Bar Chart** - Units Sold Per Month

   - Shows sales volume by month
   - Clear visual comparison
   - Hover interactions

3. **Summary Cards** - Key Metrics
   - Total revenue
   - Total units sold
   - Average monthly sales

**Features**:

- Responsive container adapts to screen size
- Formatted values (currency and numbers)
- Theme-aware colors (respects dark/light mode)
- Accessible labels and legends
- Smooth animations

**Example Usage**:

```typescript
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis tickFormatter={(value) => `$${value}`} />
    <Tooltip formatter={(value: number) => formatCurrency(value)} />
    <Legend />
    <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" />
  </LineChart>
</ResponsiveContainer>
```

## State Management Implementation

### React Context for Theme

**Location**: [`src/app/providers/ThemeProvider.tsx`](src/app/providers/ThemeProvider.tsx)

**Why React Context?**

- Lightweight for simple global state (theme)
- No external dependencies needed
- Perfect for infrequent updates
- Server-side integration via cookies

**Implementation**:

```typescript
const ThemeContext = createContext<IThemeContext | undefined>(undefined);

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    // Call server action to persist
    setThemeCookie(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**Why Not Redux or Zustand?**

- Overkill for single global state (theme)
- Adds unnecessary bundle size
- React Context is sufficient for this use case

**Why Not React Query?**

- Server Components handle data fetching
- No real-time data or frequent mutations
- Next.js caching is more efficient for static data

## Deployment Considerations

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://fakestoreapi.com
```

### Build Optimization

```bash
yarn build
```

- Static generation where possible
- Incremental Static Regeneration (ISR)
- Server-side rendering for dynamic content

### Caching Strategy

- **Static pages**: Cached indefinitely
- **Dynamic pages**: ISR with revalidation
- **API responses**: Cache with revalidation period

## Future Improvements

1. **Add E2E tests** with Playwright for full user journey testing
2. **Implement real-time updates** with WebSockets for live data
3. **Add authentication** with NextAuth.js for user management
4. **Implement shopping cart** with optimistic updates
5. **Add more comprehensive unit tests** for hooks and components
6. **Implement CI/CD** with GitHub Actions for automated testing and deployment
7. **Add monitoring** with Sentry or DataDog for error tracking
8. **Performance monitoring** with Web Vitals and Lighthouse CI
9. **Add more chart types** (pie charts, area charts) for enhanced analytics
10. **Implement data export** functionality (CSV, PDF reports)

## Technical Decisions Rationale

### Why Server Components over React Query?

**Decision**: Use Server Components for initial data fetching

**Reasoning**:

- Product data from FakeStore API is relatively static
- No real-time updates or frequent mutations needed
- Server Components provide better SEO and initial load performance
- Reduces client-side JavaScript bundle
- Leverages Next.js built-in caching (force-cache, revalidate)
- Simpler mental model for this use case

**When to use React Query instead**:

- Frequent data mutations (POST, PUT, DELETE)
- Real-time data synchronization
- Complex caching and invalidation strategies
- Optimistic updates
- Background refetching

### Why Service Layer Pattern?

**Decision**: Separate business logic from UI components

**Reasoning**:

- **Testability**: Easy to unit test business logic in isolation
- **Reusability**: Services can be used across multiple components
- **Maintainability**: Changes to business logic don't affect UI
- **Scalability**: Easy to add new business rules
- **Single Responsibility**: Each service has one clear purpose

### Why Repository Pattern?

**Decision**: Abstract data access behind repository interface

**Reasoning**:

- **Flexibility**: Easy to swap data sources (FakeStore API → GraphQL → Database)
- **Testability**: Easy to mock repositories in service tests
- **Separation of Concerns**: Data access logic separate from business logic
- **Consistency**: Single place for data transformation
- **Caching Strategy**: Centralized cache configuration

### Why Cookie-Based Theme Persistence?

**Decision**: Use server actions to set cookies for theme

**Reasoning**:

- **Server-Side Rendering**: Theme available on initial server render
- **No Flash**: No theme flicker on page load
- **Security**: Cookies can be HTTP-only if needed
- **Persistence**: Survives page refreshes and browser sessions
- **Server Integration**: Theme accessible in server components and layouts

## Conclusion

This architecture provides a solid foundation for a scalable, maintainable, and performant product analytics dashboard. The clear separation of concerns, SOLID principles, and modern Next.js patterns make it easy to extend and maintain over time.

**Key Takeaways**:

- ✅ Clean Architecture with clear layer boundaries
- ✅ SOLID principles applied throughout
- ✅ Server Components for optimal performance
- ✅ Comprehensive type safety with TypeScript
- ✅ Unit tests for critical business logic
- ✅ Modern React patterns (hooks, context)
- ✅ Responsive design with Tailwind CSS
- ✅ Interactive data visualization with Recharts
- ✅ Production-ready error handling and loading states

The patterns and principles demonstrated here scale from small projects to large enterprise applications.
