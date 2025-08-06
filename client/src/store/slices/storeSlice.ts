import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { storeService } from '../../services/storeService';

interface StoreItem {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: {
    points: number;
    currency: number;
  };
  image: string;
  isActive: boolean;
  stock: number;
  partnerData?: any;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

interface Purchase {
  _id: string;
  user: string;
  item: StoreItem;
  quantity: number;
  totalPoints: number;
  totalCurrency: number;
  status: string;
  paymentMethod: string;
  stripePaymentIntentId?: string;
  voucherCode?: string;
  partnerData?: any;
  createdAt: string;
  updatedAt: string;
}

interface StoreState {
  items: StoreItem[];
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    total: number;
    hasMore: boolean;
  };
}

const initialState: StoreState = {
  items: [],
  purchases: [],
  loading: false,
  error: null,
  pagination: {
    current: 1,
    total: 1,
    hasMore: false,
  },
};

// Async thunks
export const fetchStoreItems = createAsyncThunk(
  'store/fetchStoreItems',
  async (params: { category?: string; page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await storeService.getItems(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch store items');
    }
  }
);

export const fetchPurchases = createAsyncThunk(
  'store/fetchPurchases',
  async (params: { status?: string; page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await storeService.getPurchases(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch purchases');
    }
  }
);

export const purchaseItem = createAsyncThunk(
  'store/purchaseItem',
  async (purchaseData: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const response = await storeService.purchaseItem(purchaseData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to purchase item');
    }
  }
);

export const getStoreItem = createAsyncThunk(
  'store/getStoreItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await storeService.getItem(itemId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch store item');
    }
  }
);

const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearItems: (state) => {
      state.items = [];
      state.pagination = {
        current: 1,
        total: 1,
        hasMore: false,
      };
    },
    clearPurchases: (state) => {
      state.purchases = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch store items
      .addCase(fetchStoreItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchStoreItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch purchases
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = action.payload.data;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Purchase item
      .addCase(purchaseItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchaseItem.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases.unshift(action.payload);
      })
      .addCase(purchaseItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get store item
      .addCase(getStoreItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStoreItem.fulfilled, (state, action) => {
        state.loading = false;
        // Add or update item in the list
        const index = state.items.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(getStoreItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearItems, clearPurchases } = storeSlice.actions;
export default storeSlice.reducer;