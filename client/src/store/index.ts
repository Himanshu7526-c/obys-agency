import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import rewardsReducer from './slices/rewardsSlice';
import storeReducer from './slices/storeSlice';
import otaReducer from './slices/otaSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rewards: rewardsReducer,
    store: storeReducer,
    ota: otaReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;