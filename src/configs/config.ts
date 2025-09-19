const CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL,
  API_VERSION: "/api/v1",

  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      CHECK: "/auth/is-auth",
    },
    USERS: {
      BASE: "/users",
      LOGS: "/users/logs",
      PROFIT_CENTERS: "/users/profit-center",
    },
    EVENTS: {
      BASE: "/events",
      ATTENDANCE: "/events/attendance",
    },
    PRESENTS: {
      BASE: "/presents",
    },
    SYNC: {
      HEALTH: "/sync/health",
      TEST_CONNECTIONS: "/sync/test-connections",
      STATS: "/sync/stats",
      SYNC_ALL: "/sync/events",
      SYNC_INCREMENTAL: "/sync/events/incremental",
    },
  },

  // Request timeout
  TIMEOUT: 30000,

  // Headers
  HEADERS: {
    CONTENT_TYPE: {
      JSON: "application/json",
      FORM_DATA: "multipart/form-data",
    },
  },
} as const;

export default CONFIG;
