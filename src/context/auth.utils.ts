import { createContext, useContext } from "react";

export interface AuthContextType {
  user: any | null;
  loaded: boolean;
  imageSrc: string | null;
  isLoggedIn: () => Promise<boolean>;
  changePassword: (password: string, confirm: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isRoleAuthorized: (role: string) => boolean;
  roleOptions: string[];
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
