import api from './api';

export const storeService = {
  getItems: (params: { category?: string; page?: number; limit?: number } = {}) =>
    api.get('/store/items', { params }),

  getItem: (itemId: string) =>
    api.get(`/store/items/${itemId}`),

  purchaseItem: (purchaseData: { itemId: string; quantity: number }) =>
    api.post('/store/purchase', purchaseData),

  getPurchases: (params: { status?: string; page?: number; limit?: number } = {}) =>
    api.get('/store/purchases', { params }),

  getPurchase: (purchaseId: string) =>
    api.get(`/store/purchases/${purchaseId}`),
};