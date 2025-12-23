import { AuthProvider } from "@/context/AuthContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { Slot, Stack } from "expo-router";
import { StatusBar, View } from "react-native";
import { useFonts } from "expo-font";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "../global.css";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { colors } from "@/utils/colors";
import { statusBarState$ } from "@/hooks/useHideStatusBar";
import { useValue } from "@legendapp/state/react"

SplashScreen.preventAutoHideAsync();

const Layout = (props) => {
  const { bottom, top } = useSafeAreaInsets();
  const isStatusBarHiddenState = useValue(() => statusBarState$.hide.get())

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
        <OnboardingProvider>
          <View style={{ paddingBottom: bottom, flex: 1, paddingTop: isStatusBarHiddenState ? 0 : top }}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.lavender} />
            {/* <Slot /> */}
            <StatusBar barStyle="dark-content" backgroundColor={colors.lavender} />
            <Stack
              initialRouteName="(tabs)"
              screenOptions={{
                headerShown: false,
              }}
            />
          </View>
        </OnboardingProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default Layout;