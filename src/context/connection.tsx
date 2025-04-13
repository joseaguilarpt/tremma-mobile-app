import React, { useEffect, useState, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { ConnectivityContext } from './connection.utils';


export const ConnectivityProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable !== false;
      setIsConnected(!!connected);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isConnected }}>
      {children}
    </ConnectivityContext.Provider>
  );
};

