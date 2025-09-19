const TOKEN_KEY = "token";
const USER_KEY = "user_data";

interface UserData {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const setUserData = (userData: UserData): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
};

export const getUserData = (): UserData | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const removeUserData = (): void => {
  localStorage.removeItem(USER_KEY);
};

export const clearAuthData = (): void => {
  // Hapus token dan user data secara spesifik
  removeAuthToken();
  removeUserData();

  // Hapus semua data localStorage yang terkait dengan autentikasi
  // untuk memastikan tidak ada data sensitif yang tertinggal
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.includes("token") ||
        key.includes("auth") ||
        key.includes("user") ||
        key.includes("session"))
    ) {
      keysToRemove.push(key);
    }
  }

  // Hapus semua key yang teridentifikasi
  keysToRemove.forEach((key) => localStorage.removeItem(key));
};