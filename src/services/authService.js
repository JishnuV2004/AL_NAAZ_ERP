import axiosInstance from '../config/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post('/users/login/', credentials);
      if (response.data) {
        const { user, token = 'session-auth-token' } = response.data;
        useAuthStore.getState().login(user, token);
        toast.success(`Welcome back, ${user.username || user.name}!`);
        return response.data;
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/users/logout/');
      useAuthStore.getState().logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if backend fails, force local logout to clear broken state
      useAuthStore.getState().logout();
      toast.error('Logged out, but there was an issue clearing the server session.');
    }
  }
};
