import { AuthProvider } from "@/context/AuthContext";
import { AlertProvider } from "@/context/AlertContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { SyncProvider } from "@/context/SyncContext";
import { RevenueCatProvider } from "@/context/RevenueCatContext";
import { colors } from "@/utils/colors";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useEffect } from "react";
import { ToastAndroid, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "../global.css";
import { SystemBars } from "react-native-edge-to-edge";

SplashScreen.preventAutoHideAsync();

/**
 * Redirects based on notification type
 */
function redirect(notification: Notifications.Notification) {
  const notificationType = notification.request.content.data?.type as string;

  if (notificationType === 'period' || notificationType === 'fertile') {
    router.push('/(tabs)/predictions');
  } else if (notificationType === 'daily_log') {
    router.push('/registro');
  }
  // Educational and test notifications don't need navigation
}

/**
 * Hook to handle notification taps and deep linking
 */
function useNotificationObserver() {
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  // Handle initial notification (app opened from notification)
  useEffect(() => {
    if (lastNotificationResponse?.notification) {
      redirect(lastNotificationResponse.notification);
    }
  }, [lastNotificationResponse]);

  // Listen for notification taps while app is running
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}

const Layout = (props) => {
  const { bottom, top } = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  // Set up notification observer for deep linking
  useNotificationObserver();

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        ToastAndroid.show("Actualizada ✅", ToastAndroid.SHORT);
      }
    } catch (error) { }
  }

  useEffect(() => {
    onFetchUpdateAsync();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, paddingTop: top, backgroundColor: colors.moonWhite }}>
      <AlertProvider>
        <AuthProvider>
          <RevenueCatProvider>
            <SyncProvider>
              <OnboardingProvider>
                <SystemBars style="inverted" />
                <Stack
                  initialRouteName="index"
                  screenOptions={{
                    headerShown: false,
                  }}
                />
                <View style={{ paddingBottom: bottom, backgroundColor: colors.moonWhite }} />
              </OnboardingProvider>
            </SyncProvider>
          </RevenueCatProvider>
        </AuthProvider>
      </AlertProvider>
    </GestureHandlerRootView>
  );
}

export default Layout;