import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Restaurant, MenuItem, RestaurantFilters, PaginatedResponse, SearchResult } from '@/types';
import * as restaurantService from '@/services/restaurantService';

interface RestaurantState {
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  menuItems: MenuItem[];
  popularItems: MenuItem[];
  searchResults: SearchResult | null;
  filters: RestaurantFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  isLoading: boolean;
  isLoadingRestaurant: boolean;
  isLoadingMenu: boolean;
  isSearching: boolean;
  error: string | null;
}

const initialState: RestaurantState = {
  restaurants: [],
  currentRestaurant: null,
  menuItems: [],
  popularItems: [],
  searchResults: null,
  filters: {
    page: 1,
    limit: 12,
    sortBy: 'rating',
    sortOrder: 'desc',
  },
  pagination: null,
  isLoading: false,
  isLoadingRestaurant: false,
  isLoadingMenu: false,
  isSearching: false,
  error: null,
};

// Async thunks
export const fetchRestaurants = createAsyncThunk<
  PaginatedResponse<Restaurant>,
  RestaurantFilters | void,
  { rejectValue: string }
>(
  'restaurants/fetchRestaurants',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurants(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurants');
    }
  }
);

export const fetchRestaurantById = createAsyncThunk<
  Restaurant,
  string,
  { rejectValue: string }
>(
  'restaurants/fetchRestaurantById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurantById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant');
    }
  }
);

export const fetchRestaurantMenu = createAsyncThunk<
  { restaurant: Restaurant; categories: any[] },
  string,
  { rejectValue: string }
>(
  'restaurants/fetchRestaurantMenu',
  async (id, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getRestaurantMenu(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu');
    }
  }
);

export const fetchPopularItems = createAsyncThunk<
  MenuItem[],
  number | void,
  { rejectValue: string }
>(
  'restaurants/fetchPopularItems',
  async (limit = 20, { rejectWithValue }) => {
    try {
      const response = await restaurantService.getPopularItems(limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch popular items');
    }
  }
);

export const searchRestaurantsAndItems = createAsyncThunk<
  SearchResult,
  { query: string; page?: number; limit?: number },
  { rejectValue: string }
>(
  'restaurants/searchRestaurantsAndItems',
  async ({ query, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await restaurantService.searchRestaurantsAndItems(query, page, limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<RestaurantFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 12,
        sortBy: 'rating',
        sortOrder: 'desc',
      };
    },

    clearCurrentRestaurant: (state) => {
      state.currentRestaurant = null;
      state.menuItems = [];
    },

    clearSearchResults: (state) => {
      state.searchResults = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    setPage: (state, action: PayloadAction<number>) => {
      state.filters.page = action.payload;
    },

    nextPage: (state) => {
      if (state.pagination?.hasNext) {
        state.filters.page = (state.filters.page || 1) + 1;
      }
    },

    prevPage: (state) => {
      if (state.pagination?.hasPrev) {
        state.filters.page = Math.max((state.filters.page || 1) - 1, 1);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Restaurants
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.restaurants = action.payload.data || [];
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch restaurants';
      });

    // Fetch Restaurant by ID
    builder
      .addCase(fetchRestaurantById.pending, (state) => {
        state.isLoadingRestaurant = true;
        state.error = null;
      })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => {
        state.isLoadingRestaurant = false;
        state.currentRestaurant = action.payload;
        state.error = null;
      })
      .addCase(fetchRestaurantById.rejected, (state, action) => {
        state.isLoadingRestaurant = false;
        state.currentRestaurant = null;
        state.error = action.payload || 'Failed to fetch restaurant';
      });

    // Fetch Restaurant Menu
    builder
      .addCase(fetchRestaurantMenu.pending, (state) => {
        state.isLoadingMenu = true;
        state.error = null;
      })
      .addCase(fetchRestaurantMenu.fulfilled, (state, action) => {
        state.isLoadingMenu = false;
        state.currentRestaurant = action.payload.restaurant;
        
        // Flatten menu items from categories
        const menuItems: MenuItem[] = [];
        action.payload.categories.forEach(category => {
          if (category.menuItems) {
            menuItems.push(...category.menuItems);
          }
        });
        state.menuItems = menuItems;
        state.error = null;
      })
      .addCase(fetchRestaurantMenu.rejected, (state, action) => {
        state.isLoadingMenu = false;
        state.error = action.payload || 'Failed to fetch menu';
      });

    // Fetch Popular Items
    builder
      .addCase(fetchPopularItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPopularItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.popularItems = action.payload;
        state.error = null;
      })
      .addCase(fetchPopularItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch popular items';
      });

    // Search Restaurants and Items
    builder
      .addCase(searchRestaurantsAndItems.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchRestaurantsAndItems.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
        state.error = null;
      })
      .addCase(searchRestaurantsAndItems.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload || 'Search failed';
      });
  },
});

export const {
  setFilters,
  resetFilters,
  clearCurrentRestaurant,
  clearSearchResults,
  clearError,
  setPage,
  nextPage,
  prevPage,
} = restaurantSlice.actions;

// Selectors
export const selectRestaurants = (state: { restaurants: RestaurantState }) => state.restaurants.restaurants;
export const selectCurrentRestaurant = (state: { restaurants: RestaurantState }) => state.restaurants.currentRestaurant;
export const selectMenuItems = (state: { restaurants: RestaurantState }) => state.restaurants.menuItems;
export const selectPopularItems = (state: { restaurants: RestaurantState }) => state.restaurants.popularItems;
export const selectSearchResults = (state: { restaurants: RestaurantState }) => state.restaurants.searchResults;
export const selectRestaurantFilters = (state: { restaurants: RestaurantState }) => state.restaurants.filters;
export const selectRestaurantPagination = (state: { restaurants: RestaurantState }) => state.restaurants.pagination;
export const selectRestaurantLoading = (state: { restaurants: RestaurantState }) => state.restaurants.isLoading;
export const selectRestaurantDetailLoading = (state: { restaurants: RestaurantState }) => state.restaurants.isLoadingRestaurant;
export const selectMenuLoading = (state: { restaurants: RestaurantState }) => state.restaurants.isLoadingMenu;
export const selectSearchLoading = (state: { restaurants: RestaurantState }) => state.restaurants.isSearching;
export const selectRestaurantError = (state: { restaurants: RestaurantState }) => state.restaurants.error;

export default restaurantSlice.reducer;