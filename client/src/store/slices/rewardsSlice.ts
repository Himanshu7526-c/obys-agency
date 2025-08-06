import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { rewardsService } from '../../services/rewardsService';

interface Reward {
  _id: string;
  type: string;
  title: string;
  description: string;
  pointsValue: number;
  status: string;
  source: string;
  sourceId?: any;
  expiresAt?: string;
  redeemedAt?: string;
  voucherCode?: string;
  partnerData?: any;
  createdAt: string;
  updatedAt: string;
}

interface Activity {
  _id: string;
  type: string;
  title: string;
  description: string;
  pointsReward: number;
  status: string;
  completedAt?: string;
  expiresAt?: string;
  requirements?: any;
  metadata?: any;
  partnerData?: any;
  createdAt: string;
  updatedAt: string;
}

interface RewardsState {
  rewards: Reward[];
  activities: Activity[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    total: number;
    hasMore: boolean;
  };
}

const initialState: RewardsState = {
  rewards: [],
  activities: [],
  loading: false,
  error: null,
  pagination: {
    current: 1,
    total: 1,
    hasMore: false,
  },
};

// Async thunks
export const fetchRewards = createAsyncThunk(
  'rewards/fetchRewards',
  async (params: { status?: string; type?: string; page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await rewardsService.getRewards(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch rewards');
    }
  }
);

export const fetchActivities = createAsyncThunk(
  'rewards/fetchActivities',
  async (params: { status?: string; type?: string; page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await rewardsService.getActivities(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch activities');
    }
  }
);

export const redeemReward = createAsyncThunk(
  'rewards/redeemReward',
  async (rewardId: string, { rejectWithValue }) => {
    try {
      const response = await rewardsService.redeemReward(rewardId);
      return { rewardId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to redeem reward');
    }
  }
);

export const completeActivity = createAsyncThunk(
  'rewards/completeActivity',
  async (activityId: string, { rejectWithValue }) => {
    try {
      const response = await rewardsService.completeActivity(activityId);
      return { activityId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to complete activity');
    }
  }
);

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRewards: (state) => {
      state.rewards = [];
      state.pagination = {
        current: 1,
        total: 1,
        hasMore: false,
      };
    },
    clearActivities: (state) => {
      state.activities = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch rewards
      .addCase(fetchRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.data;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Redeem reward
      .addCase(redeemReward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemReward.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.rewards.findIndex(reward => reward._id === action.payload.rewardId);
        if (index !== -1) {
          state.rewards[index] = action.payload.data;
        }
      })
      .addCase(redeemReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Complete activity
      .addCase(completeActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeActivity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.activities.findIndex(activity => activity._id === action.payload.activityId);
        if (index !== -1) {
          state.activities[index] = action.payload.data.activity;
        }
        // Add the new reward to the rewards list
        state.rewards.unshift(action.payload.data.reward);
      })
      .addCase(completeActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearRewards, clearActivities } = rewardsSlice.actions;
export default rewardsSlice.reducer;