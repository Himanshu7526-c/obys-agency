import api from './api';

export const authService = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (userData: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post('/auth/register', userData),

  getCurrentUser: () =>
    api.get('/auth/me'),

  updateProfile: (profileData: any) =>
    api.put('/auth/me', profileData),

  changePassword: (passwordData: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', passwordData),

  logout: () =>
    api.post('/auth/logout'),
};