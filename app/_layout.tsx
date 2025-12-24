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
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import "../global.css";

SplashScreen.preventAutoHideAsync();

const Layout = (props) => {
  const { bottom, top } = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });


  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SyncProvider>
          <OnboardingProvider>
            <View style={{ paddingBottom: bottom, flex: 1, paddingTop: top }}>
              <StatusBar barStyle="dark-content" backgroundColor={colors.lavender} />
              {/* <Slot /> */}
              <StatusBar barStyle="dark-content" backgroundColor={colors.lavender} />
              <Stack
                initialRouteName="index"
                screenOptions={{
                  headerShown: false,
                }}
              />
            </View>
          </OnboardingProvider>
        </SyncProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default Layout;