import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/context/OnboardingContext';

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isComplete, isLoading } = useOnboarding();

  useEffect(() => {
    // If onboarding is already complete, redirect to home
    if (!isLoading && isComplete) {
      router.replace('/home');
    }
  }, [isComplete, isLoading]);

  // Don't show splash if onboarding is complete
  if (isComplete) {
    return null;
  }

  return (
    <ScrollView
      className="flex-1 bg-[#f5f6f8]"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 items-center justify-center px-6 relative">
        {/* Background decorative blobs */}
        <View className="absolute top-[-10%] left-[-10%] w-[70%] h-[40%] rounded-full bg-[#256af4]/10 blur-3xl" />
        <View className="absolute bottom-[-5%] right-[-5%] w-[60%] h-[40%] rounded-full bg-[#256af4]/5 blur-3xl" />

        {/* Logo / Hero Visual */}
        <View className="relative z-10">
          <View className="w-48 h-48 rounded-full overflow-hidden ">
            <Image contentFit='contain' source={require('../assets/images/bg_icon.png')} style={{ width: '100%', height: '100%' }} />
          </View>
        </View>

        {/* Title & Tagline */}
        <View className="text-center space-y-4 z-10">
          <Text className="text-[40px] font-bold tracking-tight text-[#111318] leading-tight text-center mb-4">
            Lunaria
          </Text>
          <Text className="text-slate-500 text-lg font-normal leading-relaxed max-w-[280px] mx-auto text-center">
            Seguimiento menstrual sencillo y privado.{'\n'} {'\n'}
            <Text className="text-[#256af4] font-medium text-center">Tu ciclo, tu control.</Text>
          </Text>
        </View>
      </View>

      {/* Footer / Action Area */}
      <View className="w-full px-6 pb-10 pt-4 relative z-10 ">
        <Pressable
          onPress={() => router.push('/onboarding/info')}
          className="flex flex-row align-center w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 text-white text-lg font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/25 bg-blue-600 transition-colors active:scale-[0.98]">
          <Text className="truncate text-white">Comenzar</Text>
          <View className="flex-row items-center justify-center ml-2">
            <ArrowRight size={20} color="white" />
          </View>
        </Pressable>
        <Text className="mt-4 text-center text-base  text-slate-400">
          Al continuar, aceptas nuestros Términos de Servicio.
        </Text>
      </View>
    </ScrollView >
  );
}
