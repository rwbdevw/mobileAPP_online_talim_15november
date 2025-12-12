import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure how notifications are handled when received in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function getPushToken(): Promise<string | undefined> {
  try {
    // Request permissions
    const perm = await Notifications.getPermissionsAsync();
    let granted = perm.granted || (perm.ios as any)?.status === 'granted';
    if (!granted) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted || (req.ios as any)?.status === 'granted';
    }
    if (!granted) return undefined;

    // Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const projectId = (Constants as any)?.expoConfig?.extra?.eas?.projectId;
    const expoToken = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined as any
    );
    return expoToken.data;
  } catch (e) {
    return undefined;
  }
}
