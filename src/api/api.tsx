import axios from "axios";
import { API_URL } from "@/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigate } from "@/utils/navigation";

const api = axios.create({
  baseURL: API_URL, // Replace with your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_DATA_KEY = "authData";

// Save authentication data to AsyncStorage
export const saveAuthData = async (data: {
  token: string;
  refreshToken: string;
  user: any;
  expiration: number;
}) => {
  try {
    await AsyncStorage.setItem(AUTH_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save auth data:", e);
  }
};

// Clear authentication data from AsyncStorage
export const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_DATA_KEY);
  } catch (e) {
    console.error("Failed to clear auth data:", e);
  }
};

// Decode user data
const decodeUserData = (data: any) => {
  return {
    name: data.Nombre,
    lastname: data.Apellido1,
    email: data.Email,
    id: data.Id,
    username: data.Login,
    role: data.Roles,
    original: data,
  };
};

// Fetch current user data
export const getUserData = async (token?: string) => {
  const config: any = {};
  if (token) {
    config.headers = {
      Authorization: `Bearer ${token}`,
    };
  }
  try {
    const response = await axios.get(`${API_URL}/users/current`, config);
    return decodeUserData(response?.data);
  } catch (e) {
    throw e;
  }
};

// Get authentication data from AsyncStorage
export const getAuthData = async () => {
  try {
    const data = await AsyncStorage.getItem(AUTH_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to get auth data:", e);
    return null;
  }
};

// Refresh token
export const refreshAuthToken = async () => {
  try {
    const authData = await getAuthData();
    if (!authData?.refreshToken) {
      await clearAuthData();
      throw new Error("No refresh token available");
    }

    const { data } = await api.post(API_URL + "/auth/refresh-token", {
      token: {
        Refresh_token: authData?.refreshToken,
        Access_token: authData?.token,
        Expires_in: authData?.expiration,
      },
    });

    const response = {
      data: {
        token: data?.token?.Access_token,
        refreshToken: data?.token?.Refresh_token,
        user: {},
        expiresIn: data?.token?.Expires_in,
      },
    };

    const expirationTime = Date.now() + response.data.expiresIn * 1000;

    // Update API instance with new token
    updateApiInstance(response?.data?.token);

    // Fetch updated user details
    const userData = await getUserData(response?.data?.token);

    // Save updated auth details
    await saveAuthData({
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      user: userData,
      expiration: expirationTime,
    });

    return response.data;
  } catch (e) {
    await clearAuthData();
    throw e;
  }
};

// Retrieve token from AsyncStorage
export const getToken = async (): Promise<string | null> => {
  try {
    const authData = await AsyncStorage.getItem("authData");
    return authData ? JSON.parse(authData).token : null;
  } catch (e) {
    console.error("Failed to get token:", e);
    return null;
  }
};

// Check if the token is expired
const isTokenExpired = async (): Promise<boolean> => {
  const authData = await getAuthData();
  return !authData || Date.now() > authData.expiration; // Check if the token is expired
};

// Update Axios instance with a new token
export const updateApiInstance = (token?: string) =>
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

// Add a request interceptor to attach the token to requests
api.interceptors.request.use(async (config) => {
  try {
    const configToken = config.headers.Authorization;
    const storageToken = await getToken();
    if (!configToken && storageToken) {
      config.headers["Authorization"] = `Bearer ${storageToken}`;
    }
  } catch (e) {
    console.error("Failed to attach token:", e);
  }
  return config;
});

// Add a response interceptor to handle token refresh on 401 errors
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is 401 (Unauthorized), and retry is not set or the token has expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest._isRefreshing
    ) {
      originalRequest._retry = true;

      // Set a flag that indicates a token refresh is in progress
      originalRequest._isRefreshing = true;

      try {
        // Refresh the token
        const response = await refreshAuthToken();

        // Update the Authorization header with the new token
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response?.token}`;
        originalRequest.headers["Authorization"] = `Bearer ${response?.token}`;

        // Retry the original request with the new token
        return axios(originalRequest);
      } catch (refreshError) {
        await clearAuthData();

        // Handle navigation to login screen (React Navigation)
        console.error("Session expired. Redirecting to login.");
        navigate("Login");
        throw refreshError; // Let the app handle navigation outside this service
      } finally {
        // Reset the retry flag once the refresh is complete
        delete originalRequest._isRefreshing;
      }
    }

    // If the error is not related to the token refresh, reject the request
    return Promise.reject(error);
  }
);

export default api;
