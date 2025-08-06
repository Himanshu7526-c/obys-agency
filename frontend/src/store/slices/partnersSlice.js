import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for partner operations
export const fetchPartners = createAsyncThunk(
  'partners/fetchPartners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/ota/partners');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch partners');
    }
  }
);

export const fetchVouchers = createAsyncThunk(
  'partners/fetchVouchers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/ota/vouchers?${queryParams}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vouchers');
    }
  }
);

export const createVoucher = createAsyncThunk(
  'partners/createVoucher',
  async ({ voucherId, userPoints }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ota/vouchers/create', {
        voucherId,
        userPoints
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create voucher');
    }
  }
);

export const checkVoucherStatus = createAsyncThunk(
  'partners/checkVoucherStatus',
  async (voucherId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ota/vouchers/${voucherId}/status`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check voucher status');
    }
  }
);

export const testPartnerConnection = createAsyncThunk(
  'partners/testConnection',
  async (partnerId, { rejectWithValue }) => {
    try {
      const response = await api.post('/ota/test-connection', { partnerId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Connection test failed');
    }
  }
);

const initialState = {
  partners: [],
  vouchers: [],
  userVouchers: [],
  selectedPartner: null,
  connectionStatus: {},
  loading: {
    partners: false,
    vouchers: false,
    creating: false,
    testing: false,
  },
  error: null,
  filters: {
    category: '',
    partnerId: '',
    minPoints: '',
    maxPoints: '',
  },
};

const partnersSlice = createSlice({
  name: 'partners',
  initialState,
  reducers: {
    setSelectedPartner: (state, action) => {
      state.selectedPartner = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        partnerId: '',
        minPoints: '',
        maxPoints: '',
      };
    },
    addUserVoucher: (state, action) => {
      state.userVouchers.push(action.payload);
    },
    updateVoucherStatus: (state, action) => {
      const { id, status } = action.payload;
      const voucher = state.userVouchers.find(v => v.id === id);
      if (voucher) {
        voucher.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Partners
      .addCase(fetchPartners.pending, (state) => {
        state.loading.partners = true;
        state.error = null;
      })
      .addCase(fetchPartners.fulfilled, (state, action) => {
        state.loading.partners = false;
        state.partners = action.payload;
      })
      .addCase(fetchPartners.rejected, (state, action) => {
        state.loading.partners = false;
        state.error = action.payload;
      })
      // Fetch Vouchers
      .addCase(fetchVouchers.pending, (state) => {
        state.loading.vouchers = true;
        state.error = null;
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.loading.vouchers = false;
        state.vouchers = action.payload;
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.loading.vouchers = false;
        state.error = action.payload;
      })
      // Create Voucher
      .addCase(createVoucher.pending, (state) => {
        state.loading.creating = true;
        state.error = null;
      })
      .addCase(createVoucher.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.userVouchers.push(action.payload);
      })
      .addCase(createVoucher.rejected, (state, action) => {
        state.loading.creating = false;
        state.error = action.payload;
      })
      // Check Voucher Status
      .addCase(checkVoucherStatus.fulfilled, (state, action) => {
        const voucher = state.userVouchers.find(v => v.id === action.payload.id);
        if (voucher) {
          voucher.status = action.payload.status;
          voucher.remainingValue = action.payload.remainingValue;
          voucher.lastChecked = action.payload.checkedAt;
        }
      })
      // Test Connection
      .addCase(testPartnerConnection.pending, (state) => {
        state.loading.testing = true;
      })
      .addCase(testPartnerConnection.fulfilled, (state, action) => {
        state.loading.testing = false;
        state.connectionStatus[action.payload.partnerId] = action.payload;
      })
      .addCase(testPartnerConnection.rejected, (state, action) => {
        state.loading.testing = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedPartner,
  clearError,
  setFilters,
  clearFilters,
  addUserVoucher,
  updateVoucherStatus,
} = partnersSlice.actions;

export default partnersSlice.reducer;