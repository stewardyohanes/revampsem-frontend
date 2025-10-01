import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: AxiosError) => boolean;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    const code = error.response?.data?.code || error.code;

    // Handle specific HTTP status codes
    if (status === 401) {
      return {
        message: "Your session has expired. Please login again to continue.",
        status,
        code,
      };
    }

    if (status === 403) {
      return {
        message: "Access denied. Only Administrators can perform QR Code regeneration.",
        status,
        code,
      };
    }

    // Handle network errors specifically
    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED" || error.code === "ERR_CONNECTION_REFUSED") {
      return {
        message: `Network connection failed. Please ensure the backend server is running and accessible. Endpoint: ${error.config?.baseURL || 'Unknown'}`,
        status,
        code: error.code,
      };
    }

    // Handle server errors
    if (status && status >= 500) {
      return {
        message: "A server error occurred. Please try again in a few moments.",
        status,
        code,
      };
    }

    return {
      message,
      status,
      code,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: "An unknown error occurred",
  };
};

const defaultRetryCondition = (error: AxiosError): boolean => {
  // Retry pada network errors atau server errors (5xx)
  return (
    error.code === "ERR_NETWORK" ||
    error.code === "ECONNREFUSED" ||
    error.code === "ERR_CONNECTION_REFUSED" ||
    (error.response?.status !== undefined && error.response.status >= 500)
  );
};

export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    delay = 1000,
    backoffMultiplier = 2,
    retryCondition = defaultRetryCondition,
  } = options;

  let lastError: Error;
  let currentDelay = delay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Jika ini adalah attempt terakhir, throw error
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Cek apakah error memenuhi kondisi untuk retry
      if (error instanceof AxiosError && !retryCondition(error)) {
        throw lastError;
      }

      // Wait sebelum retry (tanpa console.log)
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      
      // Increase delay untuk next attempt (exponential backoff)
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError!;
};

// Helper function khusus untuk QR Code operations
export const withQRCodeRetry = async <T>(
  fn: () => Promise<T>
): Promise<T> => {
  return withRetry(fn, {
    maxRetries: 2,
    delay: 1500,
    backoffMultiplier: 1.5,
    retryCondition: (error: AxiosError) => {
      // Retry untuk network errors dan server errors, tapi tidak untuk auth errors
      return (
        (error.code === "ERR_NETWORK" ||
         error.code === "ECONNREFUSED" ||
         error.code === "ERR_CONNECTION_REFUSED" ||
         (error.response?.status !== undefined && error.response.status >= 500)) &&
        error.response?.status !== 401 && // Jangan retry untuk unauthorized
        error.response?.status !== 403    // Jangan retry untuk forbidden
      );
    }
  });
};
