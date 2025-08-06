import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { otaService } from '../../services/otaService';

interface Partner {
  id: string;
  name: string;
  type: string;
  endpoints: {
    createVoucher: string;
    purchaseAddOn: string;
    validateVoucher: string;
  };
  capabilities: string[];
}

interface Voucher {
  id: string;
  code: string;
  amount: number;
  currency: string;
  description: string;
  partnerId: string;
  userId: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  partnerId: string;
  category: string;
  image: string;
}

interface Purchase {
  id: string;
  addonId: string;
  partnerId: string;
  userId: string;
  quantity: number;
  totalPoints: number;
  status: string;
  createdAt: string;
  addon: AddOn;
}

interface OtaState {
  partners: Partner[];
  vouchers: Voucher[];
  addOns: AddOn[];
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
}

const initialState: OtaState = {
  partners: [],
  vouchers: [],
  addOns: [],
  purchases: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchPartners = createAsyncThunk(
  'ota/fetchPartners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await otaService.getPartners();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch partners');
    }
  }
);

export const createVoucher = createAsyncThunk(
  'ota/createVoucher',
  async ({ partnerId, voucherData }: { partnerId: string; voucherData: any }, { rejectWithValue }) => {
    try {
      const response = await otaService.createVoucher(partnerId, voucherData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create voucher');
    }
  }
);

export const purchaseAddOn = createAsyncThunk(
  'ota/purchaseAddOn',
  async ({ partnerId, purchaseData }: { partnerId: string; purchaseData: any }, { rejectWithValue }) => {
    try {
      const response = await otaService.purchaseAddOn(partnerId, purchaseData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to purchase add-on');
    }
  }
);

export const validateVoucher = createAsyncThunk(
  'ota/validateVoucher',
  async ({ partnerId, voucherCode }: { partnerId: string; voucherCode: string }, { rejectWithValue }) => {
    try {
      const response = await otaService.validateVoucher(partnerId, voucherCode);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to validate voucher');
    }
  }
);

export const fetchAddOns = createAsyncThunk(
  'ota/fetchAddOns',
  async (partnerId: string, { rejectWithValue }) => {
    try {
      const response = await otaService.getAddOns(partnerId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch add-ons');
    }
  }
);

export const fetchVouchers = createAsyncThunk(
  'ota/fetchVouchers',
  async (partnerId: string, { rejectWithValue }) => {
    try {
      const response = await otaService.getVouchers(partnerId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch vouchers');
    }
  }
);

const otaSlice = createSlice({
  name: 'ota',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearVouchers: (state) => {
      state.vouchers = [];
    },
    clearAddOns: (state) => {
      state.addOns = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch partners
      .addCase(fetchPartners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartners.fulfilled, (state, action) => {
        state.loading = false;
        state.partners = action.payload;
      })
      .addCase(fetchPartners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create voucher
      .addCase(createVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVoucher.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers.push(action.payload);
      })
      .addCase(createVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Purchase add-on
      .addCase(purchaseAddOn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchaseAddOn.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases.push(action.payload);
      })
      .addCase(purchaseAddOn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Validate voucher
      .addCase(validateVoucher.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(validateVoucher.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(validateVoucher.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch add-ons
      .addCase(fetchAddOns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddOns.fulfilled, (state, action) => {
        state.loading = false;
        state.addOns = action.payload;
      })
      .addCase(fetchAddOns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch vouchers
      .addCase(fetchVouchers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVouchers.fulfilled, (state, action) => {
        state.loading = false;
        state.vouchers = action.payload;
      })
      .addCase(fetchVouchers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearVouchers, clearAddOns } = otaSlice.actions;
export default otaSlice.reducer;