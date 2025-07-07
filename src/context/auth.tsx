import React, { createContext, useContext, useState, useEffect } from "react";
import {
  login as loginApi,
  refreshToken as refreshTokenApi,
  getAuthData,
  isTokenExpired,
  clearAuthData,
  logout as logoutApi,
  changePassword,
  refreshUserData,
} from "../api";
import { getRoleMenuById, getRoleOptionsById } from "../api/roles";
import { useNavigation } from "@react-navigation/native";
import { AuthContextType } from "./auth.utils";
import { fetchImage } from "@/api/files";

// Create the AuthContext
export const AuthContext = createContext<any>(null);

export function AuthProvider({
  children,
}) {
  const [user, setUser] = useState<any | null>(async () => {
    return await getAuthData().then((data) => data?.user || null);
  });
  const [loaded, setLoaded] = useState(false);
  const [roleOptions, setRoleOptions] = useState<any[]>([]);
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);

  const navigation = useNavigation();

  const isLoggedIn = async () => {
    if (loaded && !user) {
      logout();
      return false;
    }
    if (user.expiration && Date.now() > user.expiration) {
      await refreshTokenApi(); // Attempt to refresh the token
      const refreshedAuthData = await getAuthData(); // Re-fetch the auth data after refreshing
      if (refreshedAuthData) {
        setLoaded(true); // Token is still valid, set loaded to true
        setUser(refreshedAuthData.user); // Update user data
        return true;
      } else {
        logout(); // If refresh fails, log out
        return false;
      }
    }
    return true;
  };
  // Login function to authenticate the user
  const login = async (email: string, password: string) => {
    try {
      const userData = await loginApi({ email, password });
      setUser(userData.user);
      setLoaded(true);
    } catch (error) {
      setLoaded(true); // Ensure loading state is set even on failure
      throw error;
    }
  };

  // Change password and refresh user data
  const changePasswordAndRefresh = async (
    password: string,
    confirmPassword: string
  ) => {
    try {
      await changePassword({ password, confirmPassword });
      const userData = await refreshUserData();
      setUser(userData);
      setLoaded(true);
    } catch (error) {
      setLoaded(true); // Ensure loading state is set even on failure
      throw error;
    }
  };

  // Fetch user roles and options
  const getUserRoles = async () => {
    setLoaded(false);
    try {
      const roleId = user?.role && user?.role[0]?.Id;
      if (roleId) {
        const roleOptions = await getRoleOptionsById(roleId);
        const menuRoleOptions = await getRoleMenuById(roleId);
        const filteredMenuOptions = (menuRoleOptions ?? [])
          .filter((item) => !item?.IsDeleted)
          .map((item) => item?.Nombre);
        const filteredOptions = (roleOptions ?? [])
          .filter((item) => !item?.IsDeleted)
          .map((item) => item?.Codigo);

        setRoleOptions([...filteredOptions, ...filteredMenuOptions]);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (user) {
      getUserRoles();
    }
    const photoId = user?.original?.Photo;
    if (photoId && !imageSrc) {
      fetchImage(photoId).then((d) => {
        if (d.uri) {
          setImageSrc(d.uri);
        }
      });
    }
  }, [user]);

  // Check if a role is authorized
  const isRoleAuthorized = (role: string) => {
    return (roleOptions ?? []).indexOf(role) !== -1;
  };

  // Remove session data and redirect to login screen
  const removeSessionData = async () => {
    setUser(null);
    setLoaded(true);
    await clearAuthData(); // Clear any stored auth data (like tokens)
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  // Logout function to clear user and token
  const logout = async () => {
    try {
      await logoutApi();
      setUser(null);
      setLoaded(false);
      await clearAuthData(); // Clear any stored auth data (like tokens)
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (e) {
      throw e;
    }
  };

  // Function to check if the token is expired and refresh it if needed
  const checkAndRefreshToken = async () => {
    try {
      const authData = await getAuthData(); // Get auth data from AsyncStorage
      if (!authData) {
        setLoaded(true); // Set loaded even if there's no auth data
        return removeSessionData(); // No auth data, log out
      }

      const isExpired = await isTokenExpired();
      if (isExpired) {
        try {
          await refreshTokenApi(); // Attempt to refresh the token
          const refreshedAuthData = await getAuthData(); // Re-fetch the auth data after refreshing
          if (refreshedAuthData) {
            setLoaded(true); // Token is still valid, set loaded to true
            setUser(refreshedAuthData.user); // Update user data
          } else {
            logout(); // If refresh fails, log out
          }
        } catch (error) {
        //  console.error("Token refresh failed:", error);
          logout(); // If token refresh fails, log out
        } finally {
          setLoaded(true); // Token is still valid, set loaded to true
        }
      } else {
        setUser(authData.user); // Set the user from stored data
        setLoaded(true); // Token is still valid, set loaded to true
      }
    } catch (error) {
      console.error("Failed to check or refresh token:", error);
      removeSessionData();
    }
  };

  // On mount, check and refresh the token if necessary
  useEffect(() => {
    checkAndRefreshToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        imageSrc,
        roleOptions,
        isLoggedIn,
        loaded,
        changePassword: changePasswordAndRefresh,
        isRoleAuthorized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
