import axios from "axios";
import CONFIG from "../configs/config";
import { handleApiError, withQRCodeRetry } from "../lib/error-handler";
import {
  setAuthToken,
  getAuthToken,
  clearAuthData,
} from "../lib/token-manager";

import {
  LoginDto,
  LoginResponseDto,
  AuthCheckResponseDto,
} from "../services/auth/dtos";

import {
  UserDto,
  CreateUserDto,
  UpdateUserDto,
  ProfitCenterDto,
  LogActivityDto,
} from "../services/users/dtos";

import {
  EventDto,
  CreateEventDto,
  UploadAttendanceDto,
  PresentDto,
  CreatePresentDto,
  UpdatePresentDto,
  PresentQueryParamsDto,
} from "../services/event/dtos";

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

import {
  QRCodeDto,
  QRCodeCheckInDto,
  QRCodeValidateResponseDto,
  QRCodeCheckInResponseDto,
  QRCodeByPresentResponseDto,
  RegenerateQRCodeDto,
  RegenerateQRCodeResponseDto,
  RegenerateAllQRCodeDto,
  RegenerateAllQRCodeResponseDto,
  RegenerateAndSendAllQRCodeDto,
  RegenerateAndSendAllQRCodeResponseDto,
  SendQRCodeEmailDto,
  SendQRCodeEmailResponseDto,
  SendQRCodeToAllDto,
  SendQRCodeToAllResponseDto,
  QRCodeErrorResponseDto,
} from "@/types/dto";

axios.defaults.baseURL = `${CONFIG.BASE_URL}${CONFIG.API_VERSION}`;
axios.defaults.timeout = CONFIG.TIMEOUT;
axios.defaults.headers.common["Content-Type"] =
  CONFIG.HEADERS.CONTENT_TYPE.JSON;

axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Response interceptor error:", error);
    console.error("Error response:", error.response);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

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

        if (responseData.token) {
          token = responseData.token;
        } else if (responseData.data && responseData.data.token) {
          token = responseData.data.token;
        } else if (responseData.access_token) {
          token = responseData.access_token;
        }

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
        const response = await axios.patch(
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
        const response = await axios.get(CONFIG.ENDPOINTS.LOGS.BASE);
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

    CREATE: async (
      data: CreateEventDto | FormData
    ): Promise<ApiResponseDto<EventDto>> => {
      try {
        const headers: Record<string, string> = {};
        if (data instanceof FormData) {
          headers["Content-Type"] = CONFIG.HEADERS.CONTENT_TYPE.FORM_DATA;
        }

        const response = await axios.post(CONFIG.ENDPOINTS.EVENTS.BASE, data, {
          headers,
        });
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
      data: Partial<CreateEventDto>
    ): Promise<ApiResponseDto<EventDto>> => {
      try {
        const response = await axios.patch(
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
        formData.append("event_id", eventId.toString());

        const response = await axios.post(
          CONFIG.ENDPOINTS.EVENTS.ATTENDANCE,
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
        const response = await axios.patch(
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
    SYNC_ALL: async (): Promise<SyncDataDto> => {
      try {
        const response = await axios.post(
          CONFIG.ENDPOINTS.SYNC.SYNC_ALL,
          {},
          {
            headers: {
              "Content-Type": CONFIG.HEADERS.CONTENT_TYPE.JSON,
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

  QRCODE: {
    REGENERATE: async (
      presentId: number
    ): Promise<RegenerateQRCodeResponseDto> => {
      try {
        const response = await axios.post(
          `${CONFIG.ENDPOINTS.QRCODE.REGENERATE}/${presentId}`
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    GET_BY_PRESENT_ID: async (
      presentId: number
    ): Promise<QRCodeByPresentResponseDto> => {
      try {
        const response = await axios.get(
          `${CONFIG.ENDPOINTS.QRCODE.PRESENT}/${presentId}`
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    VALIDATE: async (token: string): Promise<QRCodeValidateResponseDto> => {
      try {
        const response = await axios.get(
          `${CONFIG.ENDPOINTS.QRCODE.VALIDATE}/${token}`
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    CHECKIN: async (
      data: QRCodeCheckInDto
    ): Promise<QRCodeCheckInResponseDto> => {
      try {
        const response = await axios.post(
          CONFIG.ENDPOINTS.QRCODE.CHECKIN,
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

    SEND_EMAIL: async (
      data: SendQRCodeEmailDto
    ): Promise<SendQRCodeEmailResponseDto> => {
      try {
        const response = await axios.post(
          `${CONFIG.ENDPOINTS.QRCODE.SEND_EMAIL}/${data.present_id}`,
          {
            customMessage: data.customMessage,
            recipientEmail: data.recipientEmail,
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

    SEND_ALL: async (
      data: SendQRCodeToAllDto
    ): Promise<SendQRCodeToAllResponseDto> => {
      try {
        const response = await axios.post(
          `${CONFIG.ENDPOINTS.QRCODE.SEND_ALL}/${data.event_id}`,
          {
            customMessage: data.customMessage,
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

    REGENERATE_ALL: async (
      data: RegenerateAllQRCodeDto
    ): Promise<RegenerateAllQRCodeResponseDto> => {
      try {
        const response = await axios.post(
          `${CONFIG.ENDPOINTS.QRCODE.REGENERATE_ALL}/${data.event_id}`
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw handleApiError(error);
        }
        throw error;
      }
    },

    REGENERATE_AND_SEND_ALL: async (
      data: RegenerateAndSendAllQRCodeDto
    ): Promise<RegenerateAndSendAllQRCodeResponseDto> => {
      const endpoint = `${CONFIG.ENDPOINTS.QRCODE.REGENERATE_AND_SEND_ALL}/${data.event_id}`;

      return withQRCodeRetry(async () => {
        try {
          const response = await axios.post(endpoint, {
            customMessage: data.customMessage,
          });

          return response.data;
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw handleApiError(error);
          }
          throw error;
        }
      });
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
  QRCodeDto,
  QRCodeCheckInDto,
  QRCodeValidateResponseDto,
  QRCodeCheckInResponseDto,
  QRCodeByPresentResponseDto,
  RegenerateQRCodeDto,
  RegenerateQRCodeResponseDto,
  RegenerateAllQRCodeDto,
  RegenerateAllQRCodeResponseDto,
  RegenerateAndSendAllQRCodeDto,
  RegenerateAndSendAllQRCodeResponseDto,
  SendQRCodeEmailDto,
  SendQRCodeEmailResponseDto,
  SendQRCodeToAllDto,
  SendQRCodeToAllResponseDto,
  QRCodeErrorResponseDto,
};
