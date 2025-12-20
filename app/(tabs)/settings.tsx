import { ProfileCard } from '@/components/settings/ProfileCard';
import { SettingsItem } from '@/components/settings/SettingsItem';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { ToggleRow } from '@/components/settings/ToggleRow';
import MyIcon from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { colors } from '@/utils/colors';
import { formatDate } from '@/utils/dates';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version;
  const { data } = useOnboarding();
  const { user, logout } = useAuth();
  const { averageCycleLength, cycleRangeMin, cycleRangeMax, periodLength } = data;
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [aiPredictionEnabled, setAiPredictionEnabled] = useState(true);

  const userName = data.name || user?.name || 'Usuario';
  const userEmail = user?.email || 'usuario@email.com';

  const handleLogout = async () => {
    await logout();
    router.replace('/splash');
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
        <Text className="text-2xl font-bold text-text-primary">
          Perfil
        </Text>

        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-background">
          {/* <Bell size={24} color={colors.textPrimary} /> */}
          <MyIcon name="Bell" className="text-text-primary" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        className="px-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="h-20 " />
        {/* Profile Card */}
        <ProfileCard
          name={userName}
          email={userEmail}
          avatarUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuAN6IrQ_FpbYLpB4Usi_IRFDz-jqCFglsJmCLRaWMXZNIpdGZkAGLIZOdN2DoX8QRSVfk206Zu57M_TwasxtCmJW2l17m2IkaRyXZQuXclAIh6oBeqsuHP8Z5Iz3v-s4e3ktrVmnvbLXqNezeNjLiW4AKoOgu3pWM8y-SCbQDhPS84KiCrcmxOul4wliFLLJAC3cNSNIjOE9riaJkGZi0a2nkJmIISwRpUsMq4RYmHP0_HldgRG9RIBxyT7KhFHBHFSB89wa0kSCDc"
          isPremium
        />

        {/* Mi Ciclo */}
        <SettingsSection title="Mi Ciclo">
          <SettingsItem
            icon="Droplet"
            iconBg="bg-blue-100"
            iconColor="text-blue-500"
            title="Duración del periodo"
            subtitle={`${periodLength} día${periodLength > 1 ? 's' : ''}`}
          />
          <SettingsItem
            icon="RefreshCw"
            iconBg="bg-blue-100"
            iconColor="text-blue-500"
            title="Duración del ciclo"
            subtitle={`${averageCycleLength} día${averageCycleLength > 1 ? 's' : ''}`}
            showDivider
          />
          <SettingsItem
            icon="CalendarDays"
            iconBg="bg-blue-100"
            iconColor="text-blue-500"
            title="Último periodo"
            subtitle={`${formatDate(data.lastPeriodStart, 'long')}`}
            showDivider={false}
            showChevron={false}
          />
        </SettingsSection>

        {/* Preferencias */}
        <SettingsSection title="Preferencias">
          <ToggleRow
            icon="Bell"
            iconBg="bg-pink-100"
            iconColor="text-pink-500"
            title="Recordatorios"
            subtitle="Inicio y ovulación"
            value={remindersEnabled}
            onChange={setRemindersEnabled}
          />
          <ToggleRow
            icon="Sparkles"
            iconBg="bg-purple-100"
            iconColor="text-purple-500"
            title="Predicción Inteligente"
            subtitle="Usar IA para análisis"
            value={aiPredictionEnabled}
            onChange={setAiPredictionEnabled}
            showDivider={false}
          />
        </SettingsSection>

        {/* Datos */}
        <SettingsSection title="Datos">
          <SettingsItem
            icon="Download"
            iconBg="bg-orange-100"
            iconColor="text-orange-500"
            title="Exportar Reporte"
          />
          <SettingsItem
            icon="LockKeyhole"
            iconBg="bg-gray-100"
            iconColor="text-gray-500"
            title="Privacidad y Seguridad"
            showDivider={false}
          />
        </SettingsSection>

        {/* Footer */}
        <View className="mt-10 items-center gap-3">
          <TouchableOpacity className="w-full max-w-[200px] py-5 font-bold text-sm bg-red-100 rounded-full transition-colors" onPress={handleLogout}>
            <Text className="text-center text-base font-bold text-red-500">
              Cerrar Sesión
            </Text>
          </TouchableOpacity>

          <Text className="text-sm font-medium text-text-muted">
            Versión {version}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
