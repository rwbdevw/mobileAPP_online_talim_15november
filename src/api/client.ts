import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, ENDPOINTS } from '../config/constants';
import { useAuthStore, AUTH_KEYS } from '../store/auth';

const DEMO_MODE = false; // using real backend endpoints

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;
    if (status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken || (await SecureStore.getItemAsync(AUTH_KEYS.refresh));
        if (!refreshToken) throw new Error('no refresh');
        // Attempt refresh if backend is ready
        if (!DEMO_MODE) {
          const r = await api.post(ENDPOINTS.mobile.refresh, {}, { headers: { Authorization: `Bearer ${refreshToken}` } });
          const access = r.data?.access_token;
          if (access) {
            await useAuthStore.getState().setAuth({ accessToken: access });
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${access}`;
            return api(original);
          }
        }
      } catch (e) {
        // fallthrough to logout
      }
      await useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export async function login(username: string, password: string) {
  if (DEMO_MODE) {
    const fakeToken = 'demo_token_' + Math.random().toString(36).slice(2);
    await useAuthStore.getState().setAuth({ accessToken: fakeToken, user: { id: 1, username } });
    return { success: true };
  }
  const res = await api.post(ENDPOINTS.mobile.login, { username, password });
  const { access_token, refresh_token, user } = res.data ?? {};
  await useAuthStore.getState().setAuth({ accessToken: access_token, refreshToken: refresh_token, user });
  // Hydrate full user profile (avatar, bio, created_at) after auth
  try {
    const r = await api.get(ENDPOINTS.mobile.me);
    if (r?.data?.user) {
      await useAuthStore.getState().setAuth({ user: r.data.user });
    }
  } catch {}
  return { success: true };
}

export async function register(username: string, email: string, password: string, role?: 'student' | 'instructor') {
  const payload: any = { username, email, password };
  if (role) payload.role = role;
  const res = await api.post(ENDPOINTS.mobile.register, payload);
  const { access_token, refresh_token, user } = res.data ?? {};
  await useAuthStore.getState().setAuth({ accessToken: access_token, refreshToken: refresh_token, user });
  // Hydrate full user profile after registration
  try {
    const r = await api.get(ENDPOINTS.mobile.me);
    if (r?.data?.user) {
      await useAuthStore.getState().setAuth({ user: r.data.user });
    }
  } catch {}
  return { success: true };
}
