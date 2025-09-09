import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Address } from '@/types';
import * as userService from '@/services/userService';

interface UserState {
  addresses: Address[];
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

const initialState: UserState = {
  addresses: [],
  isLoading: false,
  isUpdating: false,
  error: null,
};

// Async thunks
export const fetchAddresses = createAsyncThunk<
  Address[],
  void,
  { rejectValue: string }
>(
  'user/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getAddresses();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }
);

export const addAddress = createAsyncThunk<
  Address,
  Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  { rejectValue: string }
>(
  'user/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await userService.addAddress(addressData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add address');
    }
  }
);

export const updateAddress = createAsyncThunk<
  Address,
  { id: string; data: Partial<Address> },
  { rejectValue: string }
>(
  'user/updateAddress',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await userService.updateAddress(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update address');
    }
  }
);

export const deleteAddress = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  'user/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      await userService.deleteAddress(addressId);
      return addressId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
    }
  }
);

export const setDefaultAddress = createAsyncThunk<
  Address,
  string,
  { rejectValue: string }
>(
  'user/setDefaultAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await userService.setDefaultAddress(addressId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set default address');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    updateAddressInList: (state, action: PayloadAction<Address>) => {
      const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
      if (index >= 0) {
        state.addresses[index] = action.payload;
      }
    },

    removeAddressFromList: (state, action: PayloadAction<string>) => {
      state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch Addresses
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload;
        state.error = null;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch addresses';
      });

    // Add Address
    builder
      .addCase(addAddress.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.isUpdating = false;
        
        // If this is set as default, unset others
        if (action.payload.isDefault) {
          state.addresses = state.addresses.map(addr => ({
            ...addr,
            isDefault: false,
          }));
        }
        
        state.addresses.push(action.payload);
        state.error = null;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Failed to add address';
      });

    // Update Address
    builder
      .addCase(updateAddress.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.isUpdating = false;
        
        const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
        if (index >= 0) {
          // If this is set as default, unset others
          if (action.payload.isDefault) {
            state.addresses = state.addresses.map(addr => ({
              ...addr,
              isDefault: addr.id === action.payload.id,
            }));
          }
          
          state.addresses[index] = action.payload;
        }
        
        state.error = null;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Failed to update address';
      });

    // Delete Address
    builder
      .addCase(deleteAddress.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Failed to delete address';
      });

    // Set Default Address
    builder
      .addCase(setDefaultAddress.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.isUpdating = false;
        
        // Update all addresses - only the target should be default
        state.addresses = state.addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === action.payload.id,
        }));
        
        state.error = null;
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || 'Failed to set default address';
      });
  },
});

export const {
  clearError,
  updateAddressInList,
  removeAddressFromList,
} = userSlice.actions;

// Selectors
export const selectAddresses = (state: { user: UserState }) => state.user.addresses;
export const selectDefaultAddress = (state: { user: UserState }) => 
  state.user.addresses.find(addr => addr.isDefault);
export const selectUserLoading = (state: { user: UserState }) => state.user.isLoading;
export const selectUserUpdating = (state: { user: UserState }) => state.user.isUpdating;
export const selectUserError = (state: { user: UserState }) => state.user.error;

export const selectAddressById = (addressId: string) => (state: { user: UserState }) =>
  state.user.addresses.find(addr => addr.id === addressId);

export default userSlice.reducer;