import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import slices
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import restaurantSlice from './slices/restaurantSlice';
import cartSlice from './slices/cartSlice';
import orderSlice from './slices/orderSlice';
import userSlice from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    restaurants: restaurantSlice,
    cart: cartSlice,
    orders: orderSlice,
    user: userSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;