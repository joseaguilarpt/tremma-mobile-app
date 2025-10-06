import { configureStore } from '@reduxjs/toolkit';
import networkReducer from './slices/networkSlice';
import syncReducer from './slices/syncSlice';
import offlineReducer from './slices/offlineSlice';

export const store = configureStore({
  reducer: {
    network: networkReducer,
    sync: syncReducer,
    offline: offlineReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
