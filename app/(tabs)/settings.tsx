import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  Droplet,
  RefreshCw,
  TrendingUp,
  Download,
  Lock,
  Edit,
  ChevronRight,
  Settings as SettingsIcon
} from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '@/utils/colors';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { data } = useOnboarding();
  const { user, logout } = useAuth();

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [aiPredictionEnabled, setAiPredictionEnabled] = useState(true);

  const userName = data.name || user?.name || 'Usuario';
  const userEmail = user?.email || 'usuario@email.com';

  const handleLogout = async () => {
    await logout();
    router.replace('/splash');
  };

  return (
    <View className="flex-1 bg-moon-white">
      {/* Header */}
      <View
        className="flex-row items-center bg-white px-6 pt-6 pb-2 justify-between sticky top-0 z-20"
        style={{ paddingTop: insets.top + 24 }}
      >
        <Text className="text-text-primary text-2xl font-bold leading-tight tracking-tight">
          Perfil
        </Text>
        <View className="flex-row items-center justify-end gap-3">
          <Pressable className="flex items-center justify-center rounded-full h-10 w-10 bg-moon-white">
            <Bell size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-2 pb-6" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="mt-4">
          <View className="flex flex-col items-center justify-center rounded-[2.5rem] bg-white p-6 shadow-lg border border-gray-100 relative overflow-hidden">
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-lavender/10 rounded-full blur-2xl" />
            <View className="relative z-10 flex flex-col items-center text-center">
              {/* Profile Picture */}
              <View className="relative mb-4">
                <View
                  className="h-28 w-28 rounded-full border-4 border-white shadow-md overflow-hidden"
                  style={{ backgroundColor: '#fce7f3' }}
                >
                  <View className="h-full w-full bg-pink-200" />
                </View>
                <Pressable
                  className="absolute bottom-1 right-1 h-8 w-8 flex items-center justify-center bg-lavender rounded-full border-2 border-white shadow-sm"
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    height: 32,
                    width: 32,
                    borderRadius: 16,
                    backgroundColor: colors.lavender,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Edit size={14} color="#ffffff" />
                </Pressable>
              </View>

              <Text className="text-text-primary text-xl font-bold">{userName}</Text>
              <Text className="text-text-muted text-sm font-medium mt-1">{userEmail}</Text>

              {/* Premium Badge */}
              <View className="mt-4 flex gap-3">
                <View className="px-4 py-1.5 bg-lavender/10 rounded-full">
                  <Text className="text-lavender text-xs font-bold uppercase tracking-wide">
                    Premium
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Mi Ciclo Section */}
        <View className="mt-6">
          <Text className="px-2 mb-3 text-lg font-bold text-text-primary">Mi Ciclo</Text>
          <View className="flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <Pressable className="flex-row items-center justify-between p-4 pl-5 border-b border-gray-50">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Droplet size={20} color={colors.lavender} />
                </View>
                <View className="text-left">
                  <Text className="font-bold text-text-primary text-sm">Duración del periodo</Text>
                  <Text className="text-xs text-text-muted font-medium">
                    {data.periodLength || 5} días
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center justify-between p-4 pl-5">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <RefreshCw size={20} color={colors.lavender} />
                </View>
                <View className="text-left">
                  <Text className="font-bold text-text-primary text-sm">Duración del ciclo</Text>
                  <Text className="text-xs text-text-muted font-medium">
                    {data.cycleType === 'regular' && data.averageCycleLength
                      ? `${data.averageCycleLength} días`
                      : data.cycleRangeMin && data.cycleRangeMax
                        ? `${data.cycleRangeMin}-${data.cycleRangeMax} días`
                        : '28 días'}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Preferencias Section */}
        <View className="mt-6">
          <Text className="px-2 mb-3 text-lg font-bold text-text-primary">Preferencias</Text>
          <View className="flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <View className="flex-row items-center justify-between p-4 pl-5 border-b border-gray-50">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center">
                  <Bell size={20} color="#ec4899" />
                </View>
                <View>
                  <Text className="font-bold text-text-primary text-sm">Recordatorios</Text>
                  <Text className="text-xs text-text-muted font-medium">Inicio y ovulación</Text>
                </View>
              </View>
              <Switch
                value={remindersEnabled}
                onValueChange={setRemindersEnabled}
                trackColor={{ false: '#e5e7eb', true: colors.lavender }}
                thumbColor="#ffffff"
              />
            </View>

            <View className="flex-row items-center justify-between p-4 pl-5">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <TrendingUp size={20} color="#a855f7" />
                </View>
                <View>
                  <Text className="font-bold text-text-primary text-sm">Predicción Inteligente</Text>
                  <Text className="text-xs text-text-muted font-medium">Usar IA para análisis</Text>
                </View>
              </View>
              <Switch
                value={aiPredictionEnabled}
                onValueChange={setAiPredictionEnabled}
                trackColor={{ false: '#e5e7eb', true: colors.lavender }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Datos Section */}
        <View className="mt-6">
          <Text className="px-2 mb-3 text-lg font-bold text-text-primary">Datos</Text>
          <View className="flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <Pressable className="flex-row items-center justify-between p-4 pl-5 border-b border-gray-50">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <Download size={20} color="#f97316" />
                </View>
                <View className="text-left">
                  <Text className="font-bold text-text-primary text-sm">Exportar Reporte</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </Pressable>

            <Pressable className="flex-row items-center justify-between p-4 pl-5">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Lock size={20} color="#6b7280" />
                </View>
                <View className="text-left">
                  <Text className="font-bold text-text-primary text-sm">Privacidad y Seguridad</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* Logout Button and Version */}
        <View className="mt-8 mb-20 flex flex-col items-center justify-center gap-3">
          <Pressable
            onPress={handleLogout}
            className="w-full max-w-[200px] py-3 text-red-500 font-bold text-sm bg-red-50 rounded-xl"
          >
            <Text className="text-red-500 font-bold text-sm text-center">Cerrar Sesión</Text>
          </Pressable>
          <View className="flex flex-col items-center">
            <Text className="text-xs font-medium text-text-muted">Versión 2.4.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
