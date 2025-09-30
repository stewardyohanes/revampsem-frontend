import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleApiError = (error: unknown): ApiError => {
  console.log("Error handler - Processing error:", error);

  if (error instanceof AxiosError) {
    console.log("Error handler - AxiosError detected");
    console.log("Error handler - Response:", error.response);
    console.log("Error handler - Request:", error.request);
    console.log("Error handler - Code:", error.code);
    console.log("Error handler - Message:", error.message);

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
    console.log("Error handler - Generic Error:", error.message);
    return {
      message: error.message,
    };
  }

  console.log("Error handler - Unknown error type:", error);
  return {
    message: "An unknown error occurred",
  };
};
