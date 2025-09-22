import axios from "axios";
import CONFIG from "../configs/config";
import { handleApiError } from "../lib/error-handler";
import {
  setAuthToken,
  getAuthToken,
  clearAuthData,
} from "../lib/token-manager";
// Authentication DTOs
import {
  LoginDto,
  LoginResponseDto,
  AuthCheckResponseDto,
} from "../services/auth/dtos";

// User DTOs
import {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  ProfitCenterDto,
  LogActivityDto,
} from "../services/users/dtos";

// Event DTOs
import {
  EventDto,
  CreateEventDto,
  UploadAttendanceDto,
  PresentDto,
  CreatePresentDto,
  UpdatePresentDto,
  PresentQueryParamsDto,
} from "../services/event/dtos";

// Common DTOs (tetap di types/dto.ts)
import {
  SyncDto,
  SyncResultDto,
  SyncStatusDto,
  HealthCheckDto,
  ConnectionTestDto,
  SyncStatsDto,
  SyncDataDto,
  ApiResponseDto,
  PaginatedResponseDto,
} from "../types/dto";

// Configure axios defaults
axios.defaults.baseURL = `${CONFIG.BASE_URL}${CONFIG.API_VERSION}`;
axios.defaults.timeout = CONFIG.TIMEOUT;
axios.defaults.headers.common["Content-Type"] =
  CONFIG.HEADERS.CONTENT_TYPE.JSON;

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Clean API Object Pattern
const API = {
  AUTH: {
    LOGIN: async (data: LoginDto): Promise<LoginResponseDto> => {
      try {
        const response = await axios.post(CONFIG.ENDPOINTS.AUTH.LOGIN, data);

        if (!response.data) {
          throw new Error("No response data received from server");
        }

        const responseData = response.data;
        let token = null;
        let userData = null;

        // Extract token from various possible locations
        if (responseData.token) {
          token = responseData.token;
        } else if (responseData.data && responseData.data.token) {
          token = responseData.data.token;
        } else if (responseData.access_token) {
          token = responseData.access_token;
        }

        // Extract user data from various possible locations
        if (responseData.user) {
          userData = responseData.user;
        } else if (responseData.data && responseData.data.user) {
          userData = responseData.data.user;
        } else if (
          responseData.data &&
          !responseData.data.user &&
          responseData.data.id
        ) {
          userData = responseData.data;
        } else if (responseData.id) {
          userData = responseData;
        }

        if (!token) {
          throw new Error("No authentication token received from server");
        }

        if (!userData || !userData.id) {
          throw new Error("No user data received from server");
        }

        setAuthToken(token);

        return {
          token: token,
          user: userData,
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    CHECK: async (): Promise<AuthCheckResponseDto> => {
      try {
        const response = await axios.get(CONFIG.ENDPOINTS.AUTH.CHECK);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    LOGOUT: async (): Promise<void> => {
      try {
        clearAuthData();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },
  },

  USERS: {
    GET_ALL: async (): Promise<ApiResponseDto<UserDto[]>> => {
      try {
        const response = await axios.get(CONFIG.ENDPOINTS.USERS.BASE);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    GET_BY_ID: async (id: number): Promise<ApiResponseDto<UserDto>> => {
      try {
        const response = await axios.get(
          `${CONFIG.ENDPOINTS.USERS.BASE}/${id}`
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    CREATE: async (data: CreateUserDto): Promise<ApiResponseDto<UserDto>> => {
      try {
        const response = await axios.post(CONFIG.ENDPOINTS.USERS.BASE, data);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    UPDATE: async (
      id: number,
      data: UpdateUserDto
    ): Promise<ApiResponseDto<UserDto>> => {
      try {
        const response = await axios.put(
          `${CONFIG.ENDPOINTS.USERS.BASE}/${id}`,
          data
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    DELETE: async (id: number): Promise<ApiResponseDto<void>> => {
      try {
        const response = await axios.delete(
          `${CONFIG.ENDPOINTS.USERS.BASE}/${id}`
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    GET_LOGS: async (): Promise<ApiResponseDto<LogActivityDto[]>> => {
      try {
        const response = await axios.get(CONFIG.ENDPOINTS.USERS.LOGS);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    GET_PROFIT_CENTERS: async (): Promise<
      ApiResponseDto<ProfitCenterDto[]>
    > => {
      try {
        const response = await axios.get(CONFIG.ENDPOINTS.USERS.PROFIT_CENTERS);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },
  },

  EVENTS: {
    GET_ALL: async (): Promise<ApiResponseDto<EventDto[]>> => {
      try {
        const response = await axios.get(CONFIG.ENDPOINTS.EVENTS.BASE);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    GET_BY_ID: async (id: number): Promise<ApiResponseDto<EventDto>> => {
      try {
        const response = await axios.get(
          `${CONFIG.ENDPOINTS.EVENTS.BASE}/${id}`
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    CREATE: async (data: CreateEventDto): Promise<ApiResponseDto<EventDto>> => {
      try {
        const response = await axios.post(CONFIG.ENDPOINTS.EVENTS.BASE, data);
        console.log("x", response);
        return response.data;
      } catch (error) {
        console.log(error);
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    UPDATE: async (
      id: number,
      data: Partial<CreateEventDto>
    ): Promise<ApiResponseDto<EventDto>> => {
      try {
        const response = await axios.put(
          `${CONFIG.ENDPOINTS.EVENTS.BASE}/${id}`,
          data
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    DELETE: async (id: number): Promise<ApiResponseDto<void>> => {
      try {
        const response = await axios.delete(
          `${CONFIG.ENDPOINTS.EVENTS.BASE}/${id}`
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    UPLOAD_ATTENDANCE: async (
      eventId: number,
      file: File
    ): Promise<UploadAttendanceDto> => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
          `${CONFIG.ENDPOINTS.EVENTS.ATTENDANCE}/${eventId}`,
          formData,
          {
            headers: {
              "Content-Type": CONFIG.HEADERS.CONTENT_TYPE.FORM_DATA,
            },
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },
  },

  PRESENTS: {
    GET_ALL: async (
      params?: PresentQueryParamsDto
    ): Promise<PaginatedResponseDto<PresentDto[]>> => {
      try {
        const response = await axios.get(CONFIG.ENDPOINTS.PRESENTS.BASE, {
          params,
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    GET_BY_ID: async (id: number): Promise<ApiResponseDto<PresentDto>> => {
      try {
        const response = await axios.get(
          `${CONFIG.ENDPOINTS.PRESENTS.BASE}/${id}`
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    CREATE: async (
      data: CreatePresentDto,
      eventId?: number
    ): Promise<ApiResponseDto<PresentDto>> => {
      try {
        const url = eventId
          ? `${CONFIG.ENDPOINTS.PRESENTS.BASE}?event_id=${eventId}`
          : CONFIG.ENDPOINTS.PRESENTS.BASE;
        const response = await axios.post(url, data);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    UPDATE: async (
      id: number,
      data: UpdatePresentDto
    ): Promise<ApiResponseDto<PresentDto>> => {
      try {
        const response = await axios.put(
          `${CONFIG.ENDPOINTS.PRESENTS.BASE}/${id}`,
          data
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    DELETE: async (id: number): Promise<ApiResponseDto<void>> => {
      try {
        const response = await axios.delete(
          `${CONFIG.ENDPOINTS.PRESENTS.BASE}/${id}`
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },
  },

  SYNC: {
    HEALTH_CHECK: async (): Promise<HealthCheckDto> => {
      try {
        const response = await axios.get(CONFIG.ENDPOINTS.SYNC.HEALTH);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    TEST_CONNECTIONS: async (): Promise<ConnectionTestDto> => {
      try {
        const response = await axios.get(
          CONFIG.ENDPOINTS.SYNC.TEST_CONNECTIONS
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    GET_STATS: async (): Promise<SyncStatsDto> => {
      try {
        const response = await axios.get(CONFIG.ENDPOINTS.SYNC.STATS);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    SYNC_ALL: async (file: File): Promise<SyncDataDto> => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
          CONFIG.ENDPOINTS.SYNC.SYNC_ALL,
          formData,
          {
            headers: {
              "Content-Type": CONFIG.HEADERS.CONTENT_TYPE.FORM_DATA,
            },
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    SYNC_INCREMENTAL: async (file: File): Promise<SyncDataDto> => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
          CONFIG.ENDPOINTS.SYNC.SYNC_INCREMENTAL,
          formData,
          {
            headers: {
              "Content-Type": CONFIG.HEADERS.CONTENT_TYPE.FORM_DATA,
            },
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },
  },
} as const;

// Export the API object as default
export default API;

// Export types for use in components
export type {
  LoginDto,
  LoginResponseDto,
  AuthCheckResponseDto,
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  ProfitCenterDto,
  LogActivityDto,
  EventDto,
  CreateEventDto,
  UploadAttendanceDto,
  PresentDto,
  CreatePresentDto,
  UpdatePresentDto,
  PresentQueryParamsDto,
  SyncDto,
  SyncResultDto,
  SyncStatusDto,
  HealthCheckDto,
  ConnectionTestDto,
  SyncStatsDto,
  SyncDataDto,
  ApiResponseDto,
  PaginatedResponseDto,
};
