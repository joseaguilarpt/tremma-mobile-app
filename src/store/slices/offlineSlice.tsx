import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OfflineState {
  isOfflineMode: boolean;
  offlineData: {
    orders: any[];
    payments: any[];
    messages: any[];
    users: any[];
    returns: any[];
  };
  pending: number;
  lastOfflineSync: number | null;
  offlineActions: Array<{
    id: string;
    type: string;
    table: string;
    data: any;
    timestamp: number;
  }>;
}

const initialState: OfflineState = {
  isOfflineMode: true,
  pending: 0,
  offlineData: {
    orders: [],
    payments: [],
    messages: [],
    users: [],
    returns: [],
  },
  lastOfflineSync: null,
  offlineActions: [],
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOfflineMode: (state, action: PayloadAction<boolean>) => {
      state.isOfflineMode = true;
    },
    setPending: (state, action: PayloadAction<number>) => {
      state.pending = action.payload;
    },
    setOfflineData: (state, action: PayloadAction<{
      table: keyof OfflineState['offlineData'];
      data: any[];
    }>) => {
      const { table, data } = action.payload;
      state.offlineData[table] = data;
    },
    addOfflineAction: (state, action: PayloadAction<{
      type: string;
      table: string;
      data: any;
    }>) => {
      const newAction = {
        id: `${action.payload.table}_${Date.now()}_${Math.random()}`,
        type: action.payload.type,
        table: action.payload.table,
        data: action.payload.data,
        timestamp: Date.now(),
      };
      
      state.offlineActions.push(newAction);
    },
    removeOfflineAction: (state, action: PayloadAction<string>) => {
      state.offlineActions = state.offlineActions.filter(action => action.id !== action.payload);
    },
    clearOfflineActions: (state) => {
      state.offlineActions = [];
    },
    setLastOfflineSync: (state, action: PayloadAction<number>) => {
      state.lastOfflineSync = action.payload;
    },
    updateOfflineDataItem: (state, action: PayloadAction<{
      table: keyof OfflineState['offlineData'];
      id: string;
      updates: any;
    }>) => {
      const { table, id, updates } = action.payload;
      const itemIndex = state.offlineData[table].findIndex((item: any) => item.id === id);
      
      if (itemIndex !== -1) {
        state.offlineData[table][itemIndex] = {
          ...state.offlineData[table][itemIndex],
          ...updates,
        };
      }
    },
    removeOfflineDataItem: (state, action: PayloadAction<{
      table: keyof OfflineState['offlineData'];
      id: string;
    }>) => {
      const { table, id } = action.payload;
      state.offlineData[table] = state.offlineData[table].filter((item: any) => item.id !== id);
    },
  },
});

export const {
  setOfflineMode,
  setOfflineData,
  addOfflineAction,
  setPending,
  removeOfflineAction,
  clearOfflineActions,
  setLastOfflineSync,
  updateOfflineDataItem,
  removeOfflineDataItem,
} = offlineSlice.actions;

export default offlineSlice.reducer;
