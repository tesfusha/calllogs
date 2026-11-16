import { useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = 'calllog.driveToken';
const USER_KEY = 'calllog.driveUser';

export type DriveUser = {
  email: string;
  name?: string;
};

export type DriveState = {
  user: DriveUser | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
};

const CLIENT_ID =
  (Constants.expoConfig?.extra as { googleClientId?: string } | undefined)?.googleClientId ??
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ??
  '';

export function useGoogleDrive() {
  const [state, setState] = useState<DriveState>({
    user: null,
    accessToken: null,
    loading: true,
    error: null,
  });

  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'calllog' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['https://www.googleapis.com/auth/drive.appdata', 'openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Token,
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    },
  );

  // Restore persisted token on mount.
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'web') {
          const token = window.localStorage.getItem(TOKEN_KEY);
          const userRaw = window.localStorage.getItem(USER_KEY);
          setState({
            user: userRaw ? (JSON.parse(userRaw) as DriveUser) : null,
            accessToken: token,
            loading: false,
            error: null,
          });
        } else {
          const token = await SecureStore.getItemAsync(TOKEN_KEY);
          const userRaw = await SecureStore.getItemAsync(USER_KEY);
          setState({
            user: userRaw ? (JSON.parse(userRaw) as DriveUser) : null,
            accessToken: token,
            loading: false,
            error: null,
          });
        }
      } catch {
        setState((prev) => ({ ...prev, loading: false }));
      }
    })();
  }, []);

  // Handle OAuth response.
  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const token = response.authentication?.accessToken ?? (response.params as { access_token?: string }).access_token;
      if (!token) {
        setState((prev) => ({ ...prev, error: 'No access token returned.' }));
        return;
      }
      // Fetch user info.
      (async () => {
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const info = (await res.json()) as { email: string; name?: string };
          const user: DriveUser = { email: info.email, name: info.name };
          await persist(token, user);
          setState({ user, accessToken: token, loading: false, error: null });
        } catch (err) {
          setState((prev) => ({ ...prev, error: String(err), loading: false }));
        }
      })();
    } else if (response.type === 'error') {
      setState((prev) => ({ ...prev, error: response.error?.message ?? 'Sign-in failed.', loading: false }));
    }
  }, [response]);

  const persist = async (token: string, user: DriveUser) => {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(TOKEN_KEY, token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    }
  };

  const signIn = async () => {
    if (!CLIENT_ID) {
      setState((prev) => ({ ...prev, error: 'Google client ID not configured. Set expo.extra.googleClientId in app.json.' }));
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: null }));
    await promptAsync();
  };

  const signOut = async () => {
    if (Platform.OS === 'web') {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
    setState({ user: null, accessToken: null, loading: false, error: null });
  };

  return { ...state, request, signIn, signOut, configured: Boolean(CLIENT_ID) };
}