import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NetworkState {
  isConnected: boolean;
  connectionType: string | null;
  isInternetReachable: boolean | null;
  lastConnected: number | null;
  lastDisconnected: number | null;
}

const initialState: NetworkState = {
  isConnected: true,
  connectionType: null,
  isInternetReachable: null,
  lastConnected: null,
  lastDisconnected: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<{
      isConnected: boolean;
      connectionType: string | null;
      isInternetReachable: boolean | null;
    }>) => {
      const { isConnected, connectionType, isInternetReachable } = action.payload;
      
      // Si cambió el estado de conexión
      if (state.isConnected !== isConnected) {
        if (isConnected) {
          state.lastConnected = Date.now();
        } else {
          state.lastDisconnected = Date.now();
        }
      }
      
      state.isConnected = isConnected;
      state.connectionType = connectionType;
      state.isInternetReachable = isInternetReachable;
    },
    setLastConnected: (state, action: PayloadAction<number>) => {
      state.lastConnected = action.payload;
    },
    setLastDisconnected: (state, action: PayloadAction<number>) => {
      state.lastDisconnected = action.payload;
    },
  },
});

export const { setConnectionStatus, setLastConnected, setLastDisconnected } = networkSlice.actions;
export default networkSlice.reducer;
