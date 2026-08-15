import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('al_naaz_token') || null,
  user: localStorage.getItem('al_naaz_user') 
    ? JSON.parse(localStorage.getItem('al_naaz_user')) 
    : null,
  isAuthenticated: !!localStorage.getItem('al_naaz_token'),
  
  login: (user, token) => {
    localStorage.setItem('al_naaz_token', token);
    localStorage.setItem('al_naaz_user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('al_naaz_token');
    localStorage.removeItem('al_naaz_user');
    set({ token: null, user: null, isAuthenticated: false });
  }
}));
