import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { registerDeviceToken, unregisterDeviceToken } from '../api/mobile';
import { getPushToken } from '../utils/push';

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
    set({ accessToken, refreshToken, user });
    try {
      if (accessToken) {
        const token = await getPushToken();
        if (token) {
          await registerDeviceToken(token);
          await SecureStore.setItemAsync(AUTH_KEYS.push, token);
        }
      }
    } catch {}
  },
  logout: async () => {
    await SecureStore.deleteItemAsync(AUTH_KEYS.access);
    await SecureStore.deleteItemAsync(AUTH_KEYS.refresh);
    try {
      const t = await SecureStore.getItemAsync(AUTH_KEYS.push);
      if (t) {
        await unregisterDeviceToken(t);
        await SecureStore.deleteItemAsync(AUTH_KEYS.push);
      }
    } catch {}
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
    }
  } catch (e) {
    // noop
  }
}
