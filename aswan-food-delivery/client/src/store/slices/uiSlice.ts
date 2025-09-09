import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  language: 'ar' | 'en';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  cartSidebarOpen: boolean;
  loading: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    duration?: number;
  }>;
}

const initialState: UIState = {
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  language: (localStorage.getItem('language') as 'ar' | 'en') || 'ar',
  sidebarOpen: false,
  mobileMenuOpen: false,
  cartSidebarOpen: false,
  loading: false,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },

    setLanguage: (state, action: PayloadAction<'ar' | 'en'>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
      document.documentElement.lang = action.payload;
      document.documentElement.dir = action.payload === 'ar' ? 'rtl' : 'ltr';
    },

    toggleLanguage: (state) => {
      state.language = state.language === 'ar' ? 'en' : 'ar';
      localStorage.setItem('language', state.language);
      document.documentElement.lang = state.language;
      document.documentElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },

    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },

    setCartSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.cartSidebarOpen = action.payload;
    },

    toggleCartSidebar: (state) => {
      state.cartSidebarOpen = !state.cartSidebarOpen;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    addNotification: (state, action: PayloadAction<{
      type: 'success' | 'error' | 'info' | 'warning';
      title: string;
      message: string;
      duration?: number;
    }>) => {
      const notification = {
        id: Date.now().toString(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    closeAllModals: (state) => {
      state.sidebarOpen = false;
      state.mobileMenuOpen = false;
      state.cartSidebarOpen = false;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setLanguage,
  toggleLanguage,
  setSidebarOpen,
  toggleSidebar,
  setMobileMenuOpen,
  toggleMobileMenu,
  setCartSidebarOpen,
  toggleCartSidebar,
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  closeAllModals,
} = uiSlice.actions;

// Selectors
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectLanguage = (state: { ui: UIState }) => state.ui.language;
export const selectIsRTL = (state: { ui: UIState }) => state.ui.language === 'ar';
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectMobileMenuOpen = (state: { ui: UIState }) => state.ui.mobileMenuOpen;
export const selectCartSidebarOpen = (state: { ui: UIState }) => state.ui.cartSidebarOpen;
export const selectLoading = (state: { ui: UIState }) => state.ui.loading;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;

export default uiSlice.reducer;