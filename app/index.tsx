import { Redirect } from "expo-router";
import { useOnboarding } from "@/context/OnboardingContext";
import { View, Text } from "react-native";

export default function Index() {
  const { isComplete, isLoading } = useOnboarding();

  // Show loading state while checking onboarding status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  // If onboarding is complete, go to tabs (home)
  if (isComplete) {
    return <Redirect href="/(tabs)" />;
  }

  // Otherwise, show splash/onboarding
  return <Redirect href="/splash" />;
}
