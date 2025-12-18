import "../global.css";
import { Slot } from "expo-router";
import { View, Text } from "react-native";
import { AuthProvider } from "@/context/AuthContext";

export default function Layout() {
  return (
    <AuthProvider>
      <View className="flex flex-1 bg-white">
        <Slot />
      </View>
    </AuthProvider>
  );
}
