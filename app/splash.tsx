import { useOnboarding } from '@/context/OnboardingContext';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const { isComplete, isLoading } = useOnboarding();

  useEffect(() => {
    // If onboarding is already complete, redirect to tabs
    if (!isLoading && isComplete) {
      router.replace('/(tabs)');
    }
  }, [isComplete, isLoading]);

  // Don't show splash if onboarding is complete
  if (isComplete) {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center px-6 relative">
      <View className="absolute left-0 right-0 top-0 bottom-0  bg-linear-to-b from-5% from-primary via-background to-background animate-curtain" />
      <View className="flex-1 justify-center items-center">
        {/* Logo / Hero Visual */}
        <View className="relative z-10">
          <View className="w-48 h-48 rounded-full overflow-hidden ">
            <Image contentFit='contain' source={require('../assets/images/bg_icon.png')} style={{ width: '100%', height: '100%' }} />
          </View>
        </View>

        {/* Title & Tagline */}
        <View className="text-center space-y-4 z-10">
          <Text className="text-[40px] font-bold tracking-tight text-text-primary leading-tight text-center mb-4">
            Lunaria
          </Text>
          <Text className="text-text-muted text-lg font-normal leading-relaxed max-w-[280px] mx-auto text-center">
            Seguimiento menstrual sencillo y privado.{'\n'} {'\n'}
            <Text className="text-primary  font-bold text-center">Tu ciclo, tu control.</Text>
          </Text>
        </View>
      </View>

      {/* Footer / Action Area - Fixed at bottom */}
      <View className="w-full px-6 pt-4 mb-6">
        <Pressable
          onPress={() => router.push('/onboarding/wizard')}
          className="flex flex-row align-center w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 text-white text-lg font-bold leading-normal tracking-[0.015em] shadow-lg bg-primary transition-colors active:scale-[0.98]">
          <Text className="truncate text-white">Comenzar</Text>
          <View className="flex-row items-center justify-center ml-2">
            <ArrowRight size={20} color="white" />
          </View>
        </Pressable>
        <Text className="hidden mt-4 text-center text-base text-text-muted">
          Al continuar, aceptas nuestros Términos de Servicio.
        </Text>
      </View>
    </View>
  );
}
