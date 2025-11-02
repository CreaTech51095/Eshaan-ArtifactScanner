export interface ApiResponse<T = any> {
  data?: T
  message?: string
  success: boolean
  timestamp: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
  path?: string
  method?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
  success: boolean
  timestamp: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  params?: Record<string, string | number | boolean>
  timeout?: number
  retries?: number
}

export interface ApiClientConfig {
  baseURL: string
  timeout: number
  retries: number
  headers: Record<string, string>
}

export interface RequestInterceptor {
  onRequest?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>
  onRequestError?: (error: any) => Promise<any>
}

export interface ResponseInterceptor {
  onResponse?: (response: any) => any
  onResponseError?: (error: any) => Promise<any>
}

export interface ApiClient {
  get<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  post<T>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  put<T>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  delete<T>(url: string, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
  patch<T>(url: string, data?: any, config?: Partial<ApiRequestConfig>): Promise<ApiResponse<T>>
}

export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
}

export interface ApiValidationError extends ApiError {
  validationErrors: ValidationError[]
}

export interface HealthCheckResponse {
  status: 'ok' | 'error'
  timestamp: string
  version: string
  services: {
    database: 'ok' | 'error'
    storage: 'ok' | 'error'
    auth: 'ok' | 'error'
  }
}

export interface ApiMetrics {
  requestCount: number
  averageResponseTime: number
  errorRate: number
  lastRequestAt: string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  resetTime: string
  retryAfter?: number
}

export interface ApiRateLimitError extends ApiError {
  rateLimit: RateLimitInfo
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const

export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const

export interface ApiCacheConfig {
  enabled: boolean
  ttl: number // Time to live in seconds
  maxSize: number
  strategy: 'memory' | 'localStorage' | 'sessionStorage'
}

export interface CachedResponse<T> {
  data: T
  timestamp: number
  ttl: number
  key: string
}
