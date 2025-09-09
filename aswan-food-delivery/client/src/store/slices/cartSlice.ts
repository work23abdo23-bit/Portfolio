import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Cart, CartItem, MenuItem, Restaurant, OrderCalculation } from '@/types';
import * as orderService from '@/services/orderService';

interface CartState {
  cart: Cart;
  isLoading: boolean;
  error: string | null;
  isCalculating: boolean;
}

const initialCart: Cart = {
  restaurantId: undefined,
  restaurant: undefined,
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  tax: 0,
  discount: 0,
  total: 0,
  couponCode: undefined,
};

const initialState: CartState = {
  cart: initialCart,
  isLoading: false,
  error: null,
  isCalculating: false,
};

// Async thunks
export const calculateOrderTotal = createAsyncThunk<
  OrderCalculation,
  { restaurantId: string; items: Array<{ menuItemId: string; quantity: number }>; couponCode?: string },
  { rejectValue: string }
>(
  'cart/calculateOrderTotal',
  async ({ restaurantId, items, couponCode }, { rejectWithValue }) => {
    try {
      const response = await orderService.calculateOrder({
        restaurantId,
        items,
        couponCode,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to calculate order total');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ menuItem: MenuItem; quantity?: number; notes?: string }>) => {
      const { menuItem, quantity = 1, notes } = action.payload;

      // If cart is for a different restaurant, clear it first
      if (state.cart.restaurantId && state.cart.restaurantId !== menuItem.restaurantId) {
        state.cart = {
          ...initialCart,
          restaurantId: menuItem.restaurantId,
          restaurant: menuItem.restaurant,
        };
      }

      // Set restaurant info if not set
      if (!state.cart.restaurantId) {
        state.cart.restaurantId = menuItem.restaurantId;
        state.cart.restaurant = menuItem.restaurant;
      }

      // Check if item already exists in cart
      const existingItemIndex = state.cart.items.findIndex(
        item => item.menuItemId === menuItem.id
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        state.cart.items[existingItemIndex].quantity += quantity;
        if (notes) {
          state.cart.items[existingItemIndex].notes = notes;
        }
      } else {
        // Add new item
        state.cart.items.push({
          menuItemId: menuItem.id,
          menuItem,
          quantity,
          notes,
        });
      }

      // Recalculate subtotal
      state.cart.subtotal = state.cart.items.reduce(
        (total, item) => total + (item.menuItem.discountPrice || item.menuItem.price) * item.quantity,
        0
      );
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const menuItemId = action.payload;
      state.cart.items = state.cart.items.filter(item => item.menuItemId !== menuItemId);

      // Recalculate subtotal
      state.cart.subtotal = state.cart.items.reduce(
        (total, item) => total + (item.menuItem.discountPrice || item.menuItem.price) * item.quantity,
        0
      );

      // Clear cart if no items left
      if (state.cart.items.length === 0) {
        state.cart = initialCart;
      }
    },

    updateCartItemQuantity: (state, action: PayloadAction<{ menuItemId: string; quantity: number }>) => {
      const { menuItemId, quantity } = action.payload;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        state.cart.items = state.cart.items.filter(item => item.menuItemId !== menuItemId);
      } else {
        // Update quantity
        const itemIndex = state.cart.items.findIndex(item => item.menuItemId === menuItemId);
        if (itemIndex >= 0) {
          state.cart.items[itemIndex].quantity = quantity;
        }
      }

      // Recalculate subtotal
      state.cart.subtotal = state.cart.items.reduce(
        (total, item) => total + (item.menuItem.discountPrice || item.menuItem.price) * item.quantity,
        0
      );

      // Clear cart if no items left
      if (state.cart.items.length === 0) {
        state.cart = initialCart;
      }
    },

    updateCartItemNotes: (state, action: PayloadAction<{ menuItemId: string; notes: string }>) => {
      const { menuItemId, notes } = action.payload;
      const itemIndex = state.cart.items.findIndex(item => item.menuItemId === menuItemId);
      
      if (itemIndex >= 0) {
        state.cart.items[itemIndex].notes = notes;
      }
    },

    applyCoupon: (state, action: PayloadAction<string>) => {
      state.cart.couponCode = action.payload;
    },

    removeCoupon: (state) => {
      state.cart.couponCode = undefined;
      state.cart.discount = 0;
    },

    clearCart: (state) => {
      state.cart = initialCart;
      state.error = null;
    },

    setCartTotals: (state, action: PayloadAction<OrderCalculation>) => {
      const { subtotal, deliveryFee, tax, discount, total } = action.payload;
      state.cart.subtotal = subtotal;
      state.cart.deliveryFee = deliveryFee;
      state.cart.tax = tax;
      state.cart.discount = discount;
      state.cart.total = total;
    },

    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Calculate Order Total
    builder
      .addCase(calculateOrderTotal.pending, (state) => {
        state.isCalculating = true;
        state.error = null;
      })
      .addCase(calculateOrderTotal.fulfilled, (state, action) => {
        state.isCalculating = false;
        state.cart.subtotal = action.payload.subtotal;
        state.cart.deliveryFee = action.payload.deliveryFee;
        state.cart.tax = action.payload.tax;
        state.cart.discount = action.payload.discount;
        state.cart.total = action.payload.total;
        state.error = null;
      })
      .addCase(calculateOrderTotal.rejected, (state, action) => {
        state.isCalculating = false;
        state.error = action.payload || 'Failed to calculate order total';
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  updateCartItemNotes,
  applyCoupon,
  removeCoupon,
  clearCart,
  setCartTotals,
  clearError,
} = cartSlice.actions;

// Selectors
export const selectCart = (state: { cart: CartState }) => state.cart.cart;
export const selectCartItems = (state: { cart: CartState }) => state.cart.cart.items;
export const selectCartItemsCount = (state: { cart: CartState }) => 
  state.cart.cart.items.reduce((total, item) => total + item.quantity, 0);
export const selectCartSubtotal = (state: { cart: CartState }) => state.cart.cart.subtotal;
export const selectCartTotal = (state: { cart: CartState }) => state.cart.cart.total;
export const selectCartRestaurant = (state: { cart: CartState }) => state.cart.cart.restaurant;
export const selectCartLoading = (state: { cart: CartState }) => state.cart.isLoading;
export const selectCartCalculating = (state: { cart: CartState }) => state.cart.isCalculating;
export const selectCartError = (state: { cart: CartState }) => state.cart.error;
export const selectCartIsEmpty = (state: { cart: CartState }) => state.cart.cart.items.length === 0;

export default cartSlice.reducer;