import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import rewardsSlice from './slices/rewardsSlice';
import partnersSlice from './slices/partnersSlice';
import addonsSlice from './slices/addonsSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    rewards: rewardsSlice,
    partners: partnersSlice,
    addons: addonsSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;