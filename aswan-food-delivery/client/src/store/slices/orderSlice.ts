import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from '@/types';
import * as orderService from '@/services/orderService';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  isCreating: false,
  error: null,
};

// Async thunks
export const createOrder = createAsyncThunk<
  Order,
  {
    restaurantId: string;
    addressId: string;
    items: Array<{ menuItemId: string; quantity: number; notes?: string }>;
    paymentMethod: 'CASH' | 'CARD' | 'WALLET';
    notes?: string;
    couponCode?: string;
  },
  { rejectValue: string }
>(
  'orders/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await orderService.createOrder(orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const fetchOrders = createAsyncThunk<
  { orders: Order[]; pagination: any },
  { page?: number; limit?: number; status?: string },
  { rejectValue: string }
>(
  'orders/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrders(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderById(orderId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const cancelOrder = createAsyncThunk<
  Order,
  { orderId: string; reason?: string },
  { rejectValue: string }
>(
  'orders/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await orderService.cancelOrder(orderId, reason);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: OrderStatus; estimatedDeliveryTime?: string }>) => {
      const { orderId, status, estimatedDeliveryTime } = action.payload;
      
      // Update in orders list
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex >= 0) {
        state.orders[orderIndex].status = status;
        if (estimatedDeliveryTime) {
          state.orders[orderIndex].estimatedDeliveryTime = estimatedDeliveryTime;
        }
      }

      // Update current order if it matches
      if (state.currentOrder && state.currentOrder.id === orderId) {
        state.currentOrder.status = status;
        if (estimatedDeliveryTime) {
          state.currentOrder.estimatedDeliveryTime = estimatedDeliveryTime;
        }
      }
    },

    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },

    removeOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter(order => order.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Create Order
    builder
      .addCase(createOrder.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isCreating = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || 'Failed to create order';
      });

    // Fetch Orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.orders;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch orders';
      });

    // Fetch Order by ID
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        
        // Update in orders list if exists
        const orderIndex = state.orders.findIndex(order => order.id === action.payload.id);
        if (orderIndex >= 0) {
          state.orders[orderIndex] = action.payload;
        }
        
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch order';
      });

    // Cancel Order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Update in orders list
        const orderIndex = state.orders.findIndex(order => order.id === action.payload.id);
        if (orderIndex >= 0) {
          state.orders[orderIndex] = action.payload;
        }

        // Update current order if it matches
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        
        state.error = null;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to cancel order';
      });
  },
});

export const {
  clearCurrentOrder,
  clearError,
  updateOrderStatus,
  addOrder,
  removeOrder,
} = orderSlice.actions;

// Selectors
export const selectOrders = (state: { orders: OrderState }) => state.orders.orders;
export const selectCurrentOrder = (state: { orders: OrderState }) => state.orders.currentOrder;
export const selectOrderLoading = (state: { orders: OrderState }) => state.orders.isLoading;
export const selectOrderCreating = (state: { orders: OrderState }) => state.orders.isCreating;
export const selectOrderError = (state: { orders: OrderState }) => state.orders.error;

// Derived selectors
export const selectActiveOrders = (state: { orders: OrderState }) => 
  state.orders.orders.filter(order => 
    ![OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)
  );

export const selectCompletedOrders = (state: { orders: OrderState }) => 
  state.orders.orders.filter(order => 
    [OrderStatus.DELIVERED, OrderStatus.CANCELLED].includes(order.status)
  );

export const selectOrderById = (orderId: string) => (state: { orders: OrderState }) =>
  state.orders.orders.find(order => order.id === orderId);

export default orderSlice.reducer;