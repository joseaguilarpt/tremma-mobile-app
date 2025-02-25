import React, { useState, ReactNode } from "react";
import { useLoading } from "./loading.utils";
import { useNotifications } from "./notification.utils";
import { getMenuByUser } from "../api/dashboard";
import { NavigationContext } from "./navigation.utils";

// Provider component
export const NavigationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [menu, setMenu] = useState([]);
  const { setLoading } = useLoading();
  const { showSnackbar } = useNotifications();

  const handleGetMenu = async () => {
    setLoading(true);
    try {
      const response = await getMenuByUser();
      setMenu(response);
    } catch {
      showSnackbar(
        "Error al cargar el menu, vuelva a intentarlo luego.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleGetMenu();
  }, []);

  return (
    <NavigationContext.Provider value={{ menu, setMenu }}>
      {children}
    </NavigationContext.Provider>
  );
};
