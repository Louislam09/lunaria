import { AuthProvider } from "@/context/AuthContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { SyncProvider } from "@/context/SyncContext";
import { colors } from "@/utils/colors";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ToastAndroid, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import * as Updates from "expo-updates";
// import { SystemBars } from "react-native-edge-to-edge";
import "../global.css";
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

/**
 * Hook to handle notification taps and deep linking
 */
function useNotificationObserver() {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const notificationType = notification.request.content.data?.type as string;

      if (notificationType === 'period' || notificationType === 'fertile') {
        router.push('/(tabs)/predictions');
      } else if (notificationType === 'daily_log') {
        router.push('/registro');
      }
      // Educational and test notifications don't need navigation
    }

    // Handle initial notification (app opened from notification)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response?.notification) {
        redirect(response.notification);
      }
    });

    // Listen for notification taps while app is running
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
    <GestureHandlerRootView style={{ flex: 1, paddingTop: top, backgroundColor: colors.lavender }}>
      <AuthProvider>
        <SyncProvider>
          <OnboardingProvider>
            <StatusBar style="auto" animated />
            <Stack
              initialRouteName="index"
              screenOptions={{
                headerShown: false,
              }}
            />
            <View style={{ paddingBottom: bottom, backgroundColor: colors.moonWhite }} />
          </OnboardingProvider>
        </SyncProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default Layout;