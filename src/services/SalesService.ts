import type { ISalesService } from '@/types/interfaces';
import type { ProductSalesMetrics, MonthlySalesData } from '@/models/Product';
import type { Result } from '@/models/Common';
import { success } from '@/models/Common';

/**
 * SalesService - Business logic for sales analytics
 * Single Responsibility: Handle sales data generation and calculations
 */
export class SalesService implements ISalesService {
  private readonly months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ] as const;

  async getProductSalesMetrics(
    productId: number
  ): Promise<Result<ProductSalesMetrics>> {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));

    const metrics = this.generateMockSalesData(productId);

    return success(metrics);
  }

  generateMockSalesData(productId: number): ProductSalesMetrics {
    // Create consistent mock sales data for each product and month using the product ID as a seed
    const seed = productId;

    const monthlySales: MonthlySalesData[] = this.months.map((month, index) => {
      const baseUnits = 50 + ((seed * 7 + index * 13) % 150);

      const seasonalFactor = 0.8 + Math.sin((index / 12) * Math.PI * 2) * 0.4;

      const units = Math.round(baseUnits * seasonalFactor);

      const pricePerUnit = 10 + ((seed * 3 + index * 5) % 90);

      const revenue = units * pricePerUnit;

      return {
        month,
        sales: revenue,
        revenue,
        units,
      };
    });

    const totalRevenue = monthlySales.reduce(
      (sum, data) => sum + data.revenue,
      0
    );

    const totalUnits = monthlySales.reduce((sum, data) => sum + data.units, 0);

    const averageMonthlySales = totalRevenue / monthlySales.length;

    return {
      productId,
      monthlySales,
      totalRevenue,
      totalUnits,
      averageMonthlySales,
    };
  }
}
