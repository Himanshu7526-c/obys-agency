import api from './api';

export const rewardsService = {
  getRewards: (params: { status?: string; type?: string; page?: number; limit?: number } = {}) =>
    api.get('/rewards', { params }),

  getReward: (rewardId: string) =>
    api.get(`/rewards/${rewardId}`),

  redeemReward: (rewardId: string) =>
    api.post(`/rewards/${rewardId}/redeem`),

  getActivities: (params: { status?: string; type?: string; page?: number; limit?: number } = {}) =>
    api.get('/rewards/activities/list', { params }),

  completeActivity: (activityId: string) =>
    api.post(`/rewards/activities/${activityId}/complete`),
};