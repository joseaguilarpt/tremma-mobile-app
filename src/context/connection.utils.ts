import { createContext, useContext } from "react";

type ConnectivityContextType = {
  isConnected: boolean;
};

export const ConnectivityContext = createContext<ConnectivityContextType>({
  isConnected: true, // default as true
});

export const useConnectivity = () => useContext(ConnectivityContext);
