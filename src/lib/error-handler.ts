import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    const code = error.response?.data?.code || error.code;

    // Handle network errors specifically
    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
      return {
        message: `Network connection failed. Please check if the backend server is running and accessible at the configured URL.`,
        status,
        code: error.code,
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
