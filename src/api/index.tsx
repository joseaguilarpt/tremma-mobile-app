import axios from "axios";
import api, { updateApiInstance } from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/config";

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface CreateAccountData {
  email: string;
  password: string;
  username: string;
}

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

// Refresh user data
export const refreshUserData = async () => {
  const authData = await getAuthData();
  try {
    const userData = await getUserData(authData?.token);
    await saveAuthData({
      token: authData.token,
      refreshToken: authData.refreshToken,
      user: userData,
      expiration: authData.expiration,
    });

    return userData;
  } catch (e) {
    throw e;
  }
};

// Logout user
export const logout = async () => {
  try {
    await api.post(API_URL + "/auth/sign-out");
    await clearAuthData();
    return true;
  } catch (e) {
    throw e;
  }
};

// Login user
export const login = async (params: LoginData) => {
  try {
    const { data } = await axios.post(API_URL + "/auth/login", {
      usuario: params.email,
      password: params.password,
    });

    const response = {
      data: {
        token: data?.token?.Access_token,
        refreshToken: data?.token?.Refresh_token,
        user: {},
        expiresIn: data?.token?.Expires_in,
      },
    };

    const expirationTime = Date.now() + response.data.expiresIn * 60 * 1000;

    // Update API instance with new token
    updateApiInstance(response?.data?.token);

    // Fetch user details
    const userData = await getUserData(response?.data?.token);

    if (userData?.original?.isDeleted) {
      throw new Error("disabled-user");
    }

    // Save auth details
    const user = {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      user: userData,
      expiration: expirationTime,
    };
    await saveAuthData(user);

    return user;
  } catch (e) {
    throw e;
  }
};

// Refresh token
export const refreshToken = async () => {
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

    const expirationTime = Date.now() + response.data.expiresIn * 60 * 1000;

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

// Change password
export const changePassword = async (params) => {
  try {
    await api.post(API_URL + "/auth/reset/pass-current", params);
    return true;
  } catch (e) {
    throw e;
  }
};

// Request password reset
export const resetPasswordRequest = async (id: string) => {
  try {
    await api.put(API_URL + `/auth/reset/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};

// Create a new account
export const createAccount = async (data: CreateAccountData) => {
  return (await api.post("/auth/register", data)).data;
};

// Check if the token is expired
export const isTokenExpired = async (): Promise<boolean> => {
  const authData = await getAuthData();
  return !authData || Date.now() > authData.expiration; // Check if the token is expired
};
