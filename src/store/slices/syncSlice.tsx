import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SyncQueueItem {
  id: string;
  tableName: string;
  recordId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  priority: number;
  retryCount: number;
  lastRetry: number;
  createdAt: number;
  status: 'PENDING' | 'SYNCING' | 'COMPLETED' | 'FAILED';
}

interface SyncState {
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingItems: number;
  failedItems: number;
  syncQueue: SyncQueueItem[];
  syncProgress: {
    current: number;
    total: number;
  };
}

const initialState: SyncState = {
  isSyncing: false,
  lastSyncTime: null,
  pendingItems: 0,
  failedItems: 0,
  syncQueue: [],
  syncProgress: {
    current: 0,
    total: 0,
  },
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.isSyncing = action.payload;
    },
    setLastSyncTime: (state, action: PayloadAction<number>) => {
      state.lastSyncTime = action.payload;
    },
    addToSyncQueue: (state, action: PayloadAction<Omit<SyncQueueItem, 'id' | 'retryCount' | 'lastRetry' | 'status'>>) => {
      const newItem: SyncQueueItem = {
        ...action.payload,
        id: `${action.payload.tableName}_${action.payload.recordId}_${Date.now()}`,
        retryCount: 0,
        lastRetry: 0,
        status: 'PENDING',
      };
      
      state.syncQueue.push(newItem);
      state.pendingItems = state.syncQueue.filter(item => item.status === 'PENDING').length;
    },
    updateSyncQueueItem: (state, action: PayloadAction<{
      id: string;
      updates: Partial<SyncQueueItem>;
    }>) => {
      const { id, updates } = action.payload;
      const itemIndex = state.syncQueue.findIndex(item => item.id === id);
      
      if (itemIndex !== -1) {
        state.syncQueue[itemIndex] = { ...state.syncQueue[itemIndex], ...updates };
        
        // Recalcular contadores
        state.pendingItems = state.syncQueue.filter(item => item.status === 'PENDING').length;
        state.failedItems = state.syncQueue.filter(item => item.status === 'FAILED').length;
      }
    },
    removeFromSyncQueue: (state, action: PayloadAction<string>) => {
      state.syncQueue = state.syncQueue.filter(item => item.id !== action.payload);
      state.pendingItems = state.syncQueue.filter(item => item.status === 'PENDING').length;
      state.failedItems = state.syncQueue.filter(item => item.status === 'FAILED').length;
    },
    setSyncProgress: (state, action: PayloadAction<{ current: number; total: number }>) => {
      state.syncProgress = action.payload;
    },
    clearSyncQueue: (state) => {
      state.syncQueue = [];
      state.pendingItems = 0;
      state.failedItems = 0;
      state.syncProgress = { current: 0, total: 0 };
    },
    retryFailedItems: (state) => {
      state.syncQueue.forEach(item => {
        if (item.status === 'FAILED') {
          item.status = 'PENDING';
          item.retryCount += 1;
          item.lastRetry = Date.now();
        }
      });
      state.pendingItems = state.syncQueue.filter(item => item.status === 'PENDING').length;
      state.failedItems = state.syncQueue.filter(item => item.status === 'FAILED').length;
    },
  },
});

export const {
  setSyncing,
  setLastSyncTime,
  addToSyncQueue,
  updateSyncQueueItem,
  removeFromSyncQueue,
  setSyncProgress,
  clearSyncQueue,
  retryFailedItems,
} = syncSlice.actions;

export default syncSlice.reducer;
