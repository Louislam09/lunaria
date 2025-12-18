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
    <View className="flex-1 bg-[#f5f6f8]">
      {/* Header */}
      <View 
        className="flex-row items-center bg-white px-6 pt-6 pb-2 justify-between sticky top-0 z-20"
        style={{ paddingTop: insets.top + 24 }}
      >
        <Text className="text-[#111318] text-2xl font-bold leading-tight tracking-tight">
          Perfil
        </Text>
        <View className="flex-row items-center justify-end gap-3">
          <Pressable className="flex items-center justify-center rounded-full h-10 w-10 bg-[#f5f6f8]">
            <Bell size={20} color="#111318" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-2 pb-6" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="mt-4">
          <View className="flex flex-col items-center justify-center rounded-[2.5rem] bg-white p-6 shadow-lg border border-gray-100 relative overflow-hidden">
            <View className="absolute -top-10 -right-10 w-32 h-32 bg-[#256af4]/5 rounded-full blur-2xl" />
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
                  className="absolute bottom-1 right-1 h-8 w-8 flex items-center justify-center bg-[#256af4] rounded-full border-2 border-white shadow-sm"
                  style={{ 
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    height: 32,
                    width: 32,
                    borderRadius: 16,
                    backgroundColor: '#256af4',
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Edit size={14} color="#ffffff" />
                </Pressable>
              </View>
              
              <Text className="text-[#111318] text-xl font-bold">{userName}</Text>
              <Text className="text-[#606e8a] text-sm font-medium mt-1">{userEmail}</Text>
              
              {/* Premium Badge */}
              <View className="mt-4 flex gap-3">
                <View className="px-4 py-1.5 bg-[#256af4]/10 rounded-full">
                  <Text className="text-[#256af4] text-xs font-bold uppercase tracking-wide">
                    Premium
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Mi Ciclo Section */}
        <View className="mt-6">
          <Text className="px-2 mb-3 text-lg font-bold text-[#111318]">Mi Ciclo</Text>
          <View className="flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <Pressable className="flex-row items-center justify-between p-4 pl-5 border-b border-gray-50">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Droplet size={20} color="#256af4" />
                </View>
                <View className="text-left">
                  <Text className="font-bold text-[#111318] text-sm">Duración del periodo</Text>
                  <Text className="text-xs text-[#606e8a] font-medium">
                    {data.periodLength || 5} días
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </Pressable>
            
            <Pressable className="flex-row items-center justify-between p-4 pl-5">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <RefreshCw size={20} color="#256af4" />
                </View>
                <View className="text-left">
                  <Text className="font-bold text-[#111318] text-sm">Duración del ciclo</Text>
                  <Text className="text-xs text-[#606e8a] font-medium">
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
          <Text className="px-2 mb-3 text-lg font-bold text-[#111318]">Preferencias</Text>
          <View className="flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <View className="flex-row items-center justify-between p-4 pl-5 border-b border-gray-50">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center">
                  <Bell size={20} color="#ec4899" />
                </View>
                <View>
                  <Text className="font-bold text-[#111318] text-sm">Recordatorios</Text>
                  <Text className="text-xs text-[#606e8a] font-medium">Inicio y ovulación</Text>
                </View>
              </View>
              <Switch
                value={remindersEnabled}
                onValueChange={setRemindersEnabled}
                trackColor={{ false: '#e5e7eb', true: '#256af4' }}
                thumbColor="#ffffff"
              />
            </View>
            
            <View className="flex-row items-center justify-between p-4 pl-5">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                  <TrendingUp size={20} color="#a855f7" />
                </View>
                <View>
                  <Text className="font-bold text-[#111318] text-sm">Predicción Inteligente</Text>
                  <Text className="text-xs text-[#606e8a] font-medium">Usar IA para análisis</Text>
                </View>
              </View>
              <Switch
                value={aiPredictionEnabled}
                onValueChange={setAiPredictionEnabled}
                trackColor={{ false: '#e5e7eb', true: '#256af4' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Datos Section */}
        <View className="mt-6">
          <Text className="px-2 mb-3 text-lg font-bold text-[#111318]">Datos</Text>
          <View className="flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <Pressable className="flex-row items-center justify-between p-4 pl-5 border-b border-gray-50">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <Download size={20} color="#f97316" />
                </View>
                <View className="text-left">
                  <Text className="font-bold text-[#111318] text-sm">Exportar Reporte</Text>
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
                  <Text className="font-bold text-[#111318] text-sm">Privacidad y Seguridad</Text>
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
            <Text className="text-xs font-medium text-[#606e8a]">Versión 2.4.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
