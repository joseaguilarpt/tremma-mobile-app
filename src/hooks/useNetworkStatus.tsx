import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setConnectionStatus } from '../store/slices/networkSlice';
import { setOfflineMode } from '../store/slices/offlineSlice';

export const useNetworkStatus = () => {
  const dispatch = useDispatch();
  const { isConnected, connectionType, isInternetReachable } = useSelector(
    (state: RootState) => state.network
  );

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connectionInfo = {
        isConnected: state.isConnected ?? false,
        connectionType: state.type,
        isInternetReachable: state.isInternetReachable,
      };

      dispatch(setConnectionStatus(connectionInfo));
      
      // Determinar si estamos en modo offline
      const isOffline = !connectionInfo.isConnected || connectionInfo.isInternetReachable === false;
      dispatch(setOfflineMode(isOffline));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return {
    isConnected,
    connectionType,
    isInternetReachable,
    isOffline: !isConnected || isInternetReachable === false,
  };
};
