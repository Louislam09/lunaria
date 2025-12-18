import "../global.css";
import { Slot } from "expo-router";
import { View, Text } from "react-native";
import { AuthProvider } from "@/context/AuthContext";
import { OnboardingProvider } from "@/context/OnboardingContext";

export default function Layout() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <View className="flex flex-1 bg-white">
          <Slot />
        </View>
      </OnboardingProvider>
    </AuthProvider>
  );
}
