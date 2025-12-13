import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../config/constants';
// Push notifications temporarily disabled

export type User = {
  id: number;
  username: string;
  email?: string;
  role?: string;
};

interface AuthState {
  accessToken?: string;
  refreshToken?: string;
  user?: User | null;
  setAuth: (data: { accessToken?: string; refreshToken?: string; user?: User | null }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AUTH_KEYS = {
  access: 'ot_access_token',
  refresh: 'ot_refresh_token',
  push: 'ot_push_token',
} as const;

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: undefined,
  refreshToken: undefined,
  user: null,
  setAuth: async ({ accessToken, refreshToken, user }) => {
    if (accessToken) await SecureStore.setItemAsync(AUTH_KEYS.access, accessToken);
    if (refreshToken) await SecureStore.setItemAsync(AUTH_KEYS.refresh, refreshToken);
    set((s) => ({
      accessToken: typeof accessToken !== 'undefined' ? accessToken : s.accessToken,
      refreshToken: typeof refreshToken !== 'undefined' ? refreshToken : s.refreshToken,
      user: typeof user !== 'undefined' ? user : s.user,
    }));
  },
  logout: async () => {
    await SecureStore.deleteItemAsync(AUTH_KEYS.access);
    await SecureStore.deleteItemAsync(AUTH_KEYS.refresh);
    set({ accessToken: undefined, refreshToken: undefined, user: null });
  },
}));

export async function bootstrapAuth() {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(AUTH_KEYS.access),
      SecureStore.getItemAsync(AUTH_KEYS.refresh),
    ]);
    if (accessToken || refreshToken) {
      useAuthStore.setState({ accessToken: accessToken ?? undefined, refreshToken: refreshToken ?? undefined });
      if (accessToken) {
        try {
          const r = await axios.get(API_BASE_URL + ENDPOINTS.mobile.me, { headers: { Authorization: `Bearer ${accessToken}` } });
          const user = r.data?.user;
          if (user) useAuthStore.setState({ user });
        } catch (_) {
          // ignore
        }
      }
    }
  } catch (e) {
    // noop
  }
}
