import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SplashScreen() {
  const insets = useSafeAreaInsets();

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
        <View className="mb-10 relative z-10">
          <View className="w-48 h-48 rounded-full bg-white shadow-lg flex items-center justify-center p-10 overflow-hidden ring-4 ring-white/50">
            <View className="absolute inset-0 flex items-center justify-center bg-[#256af4]/10">
              <Text className="text-[#256af4] text-6xl">💧</Text>
            </View>
          </View>
        </View>

        {/* Title & Tagline */}
        <View className="text-center space-y-4 z-10">
          <Text className="text-[40px] font-bold tracking-tight text-[#111318] leading-tight text-center">
            FemCycle
          </Text>
          <Text className="text-slate-500 text-lg font-normal leading-relaxed max-w-[280px] mx-auto text-center">
            Seguimiento menstrual simple y privado.{'\n'}
            <Text className="text-[#256af4] font-medium">Tu ciclo, tu control.</Text>
          </Text>
        </View>
      </View>

      {/* Footer / Action Area */}
      <View className="w-full px-6 pb-10 pt-4 relative z-10" style={{ paddingBottom: insets.bottom + 40 }}>
        <Link href="/onboarding/info" asChild>
          <Pressable className="flex w-full items-center justify-center overflow-hidden rounded-full h-14 bg-[#256af4] shadow-lg">
            <View className="flex-row items-center">
              <Text className="text-white text-lg font-bold leading-normal tracking-wide">Comenzar</Text>
              <Text className="text-white text-xl ml-2">→</Text>
            </View>
          </Pressable>
        </Link>
        <Text className="mt-4 text-center text-xs text-slate-400">
          Al continuar, aceptas nuestros Términos de Servicio.
        </Text>
      </View>
    </ScrollView>
  );
}

