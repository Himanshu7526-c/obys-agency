import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchRewards = createAsyncThunk(
  'rewards/fetchRewards',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/rewards?${queryParams}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rewards');
    }
  }
);

export const redeemReward = createAsyncThunk(
  'rewards/redeemReward',
  async (rewardId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/rewards/${rewardId}/redeem`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to redeem reward');
    }
  }
);

const initialState = {
  rewards: [],
  userRewards: [],
  loading: {
    rewards: false,
    redeeming: false,
  },
  error: null,
  filters: {
    category: '',
    minPoints: '',
    maxPoints: '',
    featured: false,
  },
};

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addUserReward: (state, action) => {
      state.userRewards.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRewards.pending, (state) => {
        state.loading.rewards = true;
        state.error = null;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading.rewards = false;
        state.rewards = action.payload;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading.rewards = false;
        state.error = action.payload;
      })
      .addCase(redeemReward.pending, (state) => {
        state.loading.redeeming = true;
        state.error = null;
      })
      .addCase(redeemReward.fulfilled, (state, action) => {
        state.loading.redeeming = false;
        state.userRewards.push(action.payload.reward);
      })
      .addCase(redeemReward.rejected, (state, action) => {
        state.loading.redeeming = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setFilters, addUserReward } = rewardsSlice.actions;
export default rewardsSlice.reducer;