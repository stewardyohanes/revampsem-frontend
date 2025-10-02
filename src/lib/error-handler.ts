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

    if (status === 401) {
      return {
        message: "Your session has expired. Please login again to continue.",
        status,
        code,
      };
    }

    if (status === 403) {
      return {
        message:
          "Access denied. Only Administrators can perform QR Code regeneration.",
        status,
        code,
      };
    }

    if (
      error.code === "ERR_NETWORK" ||
      error.code === "ECONNREFUSED" ||
      error.code === "ERR_CONNECTION_REFUSED"
    ) {
      return {
        message: `Network connection failed. Please ensure the backend server is running and accessible. Endpoint: ${
          error.config?.baseURL || "Unknown"
        }`,
        status,
        code: error.code,
      };
    }

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

      if (attempt === maxRetries) {
        throw lastError;
      }

      if (error instanceof AxiosError && !retryCondition(error)) {
        throw lastError;
      }

      await new Promise((resolve) => setTimeout(resolve, currentDelay));

      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError!;
};

export const withQRCodeRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  return withRetry(fn, {
    maxRetries: 2,
    delay: 1500,
    backoffMultiplier: 1.5,
    retryCondition: (error: AxiosError) => {
      return (
        (error.code === "ERR_NETWORK" ||
          error.code === "ECONNREFUSED" ||
          error.code === "ERR_CONNECTION_REFUSED" ||
          (error.response?.status !== undefined &&
            error.response.status >= 500)) &&
        error.response?.status !== 401 &&
        error.response?.status !== 403
      );
    },
  });
};
