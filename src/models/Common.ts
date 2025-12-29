export type Result<T, E = ApiError> = Success<T> | Failure<E>;
export interface Success<T> {
  readonly success: true;
  readonly data: T;
}
export interface Failure<E = ApiError> {
  readonly success: false;
  readonly error: E;
}

export const success = <T>(data: T): Success<T> => ({
  success: true,
  data,
});

export const failure = <E = ApiError>(error: E): Failure<E> => ({
  success: false,
  error,
});
export interface ApiResponse<T> {
  readonly data?: T;
  readonly error?: ApiError;
}
export interface ApiError {
  readonly message: string;
  readonly code?: string;
  readonly statusCode?: number;
}
export interface HttpClient {
  get<T>(url: string, config?: RequestConfig): Promise<Result<T>>;
  post<T, D = unknown>(
    url: string,
    data?: D,
    config?: RequestConfig
  ): Promise<Result<T>>;
}
export interface RequestConfig {
  readonly headers?: Record<string, string>;
  readonly params?: Record<string, string | number | boolean>;
  readonly cache?: RequestCache;
  readonly next?: NextFetchRequestConfig;
}

export type Theme = 'light' | 'dark';
export interface ThemeConfig {
  readonly theme: Theme;
}
