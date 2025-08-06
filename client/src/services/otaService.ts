import api from './api';

export const otaService = {
  getPartners: () =>
    api.get('/ota/partners'),

  createVoucher: (partnerId: string, voucherData: any) =>
    api.post(`/ota/${partnerId}/vouchers`, voucherData),

  purchaseAddOn: (partnerId: string, purchaseData: any) =>
    api.post(`/ota/${partnerId}/purchase`, purchaseData),

  validateVoucher: (partnerId: string, voucherCode: string) =>
    api.post(`/ota/${partnerId}/validate`, { voucherCode }),

  getAddOns: (partnerId: string) =>
    api.get(`/ota/${partnerId}/addons`),

  getVouchers: (partnerId: string) =>
    api.get(`/ota/${partnerId}/vouchers`),
};