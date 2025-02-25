import { createContext, useContext } from "react";

// Define the context types
export interface NavigationContextType {
  menu: any[];
  setMenu: (isNavigation: any) => void;
}

// Create the NavigationContext with default values
export const NavigationContext = createContext<
  NavigationContextType | undefined
>(undefined);

// Custom hook to access loading state
export function useAppNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      "useAppNavigation must be used within a NavigationProvider",
    );
  }
  return context;
}
