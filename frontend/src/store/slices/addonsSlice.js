import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAddons = createAsyncThunk(
  'addons/fetchAddons',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/ota/addons?${queryParams}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch add-ons');
    }
  }
);

export const purchaseAddon = createAsyncThunk(
  'addons/purchaseAddon',
  async ({ addonId, paymentMethodId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ota/addons/purchase', {
        addonId,
        paymentMethodId
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to purchase add-on');
    }
  }
);

const initialState = {
  addons: [],
  purchases: [],
  loading: {
    addons: false,
    purchasing: false,
  },
  error: null,
  filters: {
    type: '',
    maxPrice: '',
  },
};

const addonsSlice = createSlice({
  name: 'addons',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addPurchase: (state, action) => {
      state.purchases.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddons.pending, (state) => {
        state.loading.addons = true;
        state.error = null;
      })
      .addCase(fetchAddons.fulfilled, (state, action) => {
        state.loading.addons = false;
        state.addons = action.payload;
      })
      .addCase(fetchAddons.rejected, (state, action) => {
        state.loading.addons = false;
        state.error = action.payload;
      })
      .addCase(purchaseAddon.pending, (state) => {
        state.loading.purchasing = true;
        state.error = null;
      })
      .addCase(purchaseAddon.fulfilled, (state, action) => {
        state.loading.purchasing = false;
        state.purchases.push(action.payload);
      })
      .addCase(purchaseAddon.rejected, (state, action) => {
        state.loading.purchasing = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, addPurchase } = addonsSlice.actions;
export default addonsSlice.reducer;