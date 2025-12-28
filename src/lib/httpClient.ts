import type { HttpClient, RequestConfig, Result } from '@/models/Common';
import { success, failure } from '@/models/Common';

/**
 * Fetch-based HTTP Client implementation
 * Handles errors and returns Result type for safe error handling
 */
export class FetchHttpClient implements HttpClient {
  constructor(private readonly baseURL: string = '') {}

  async get<T>(url: string, config?: RequestConfig): Promise<Result<T>> {
    try {
      const fullURL = this.buildURL(url, config?.params);

      const response = await fetch(fullURL, {
        method: 'GET',
        headers: config?.headers,
        cache: config?.cache,
        next: config?.next,
      });

      if (!response.ok) {
        return failure({
          message: `HTTP Error: ${response.status} ${response.statusText}`,
          code: 'HTTP_ERROR',
          statusCode: response.status,
        });
      }

      const data = (await response.json()) as T;

      return success(data);
    } catch (error) {
      return failure({
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'FETCH_ERROR',
      });
    }
  }

  async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: RequestConfig
  ): Promise<Result<T>> {
    try {
      const fullURL = this.buildURL(url, config?.params);

      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        cache: config?.cache,
        next: config?.next,
      });

      if (!response.ok) {
        return failure({
          message: `HTTP Error: ${response.status} ${response.statusText}`,
          code: 'HTTP_ERROR',
          statusCode: response.status,
        });
      }

      const responseData = (await response.json()) as T;

      return success(responseData);
    } catch (error) {
      return failure({
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'FETCH_ERROR',
      });
    }
  }

  private buildURL(
    path: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const url = this.baseURL + path;

    if (!params) {
      return url;
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    return `${url}?${searchParams.toString()}`;
  }
}
