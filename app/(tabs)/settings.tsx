import { ConflictResolutionModal } from '@/components/settings/ConflictResolutionModal';
import { ProfileCard } from '@/components/settings/ProfileCard';
import { SettingsItem } from '@/components/settings/SettingsItem';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SyncFrequencyPicker } from '@/components/settings/SyncFrequencyPicker';
import { ToggleRow } from '@/components/settings/ToggleRow';
import MyIcon from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useSync } from '@/context/SyncContext';
import { Conflict, detectConflicts, resolveConflictLocal, resolveConflictRemote } from '@/services/conflictResolution';
import { exportData, importData } from '@/services/exportImport';
import { formatDate } from '@/utils/dates';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version;
  const { data, reset, isLoading, isComplete } = useOnboarding();
  const { user, logout, isAuthenticated, localUserId } = useAuth();
  const { sync, setSyncFrequency, frequency, pendingItems, lastSyncTime, isSyncing } = useSync();
  const { averageCycleLength = 28, cycleRangeMin, cycleRangeMax, periodLength = 5 } = data;
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [aiPredictionEnabled, setAiPredictionEnabled] = useState(true);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const userName = data.name || user?.name || 'Usuario';
  const userEmail = user?.email || 'usuario@email.com';

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (!isLoading && !isComplete) {
      router.replace('/onboarding/wizard');
    }
  }, [isLoading, isComplete]);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigate directly to splash screen
              router.replace('/splash');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          },
        },
      ]
    );
  };

  const handleReset = async () => {
    Alert.alert(
      'Reiniciar Datos',
      '¿Estás seguro? Esto eliminará todos tus datos locales y te llevará al inicio.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: async () => {
            try {
              await reset();
              // Navigate directly to splash screen
              router.replace('/splash');
            } catch (error) {
              console.error('Reset error:', error);
              Alert.alert('Error', 'No se pudieron reiniciar los datos');
            }
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert('Autenticación requerida', 'Debes iniciar sesión para sincronizar tus datos.');
      return;
    }

    try {
      await sync();

      // Check for conflicts
      const detectedConflicts = await detectConflicts(user.id);
      if (detectedConflicts.length > 0) {
        setConflicts(detectedConflicts);
        setShowConflictModal(true);
      } else {
        Alert.alert('Éxito', 'Datos sincronizados correctamente.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo sincronizar. Intenta más tarde.');
    }
  };

  const handleResolveConflict = async (conflict: Conflict, keepLocal: boolean) => {
    try {
      if (keepLocal) {
        await resolveConflictLocal(conflict);
      } else {
        await resolveConflictRemote(conflict);
      }
      setConflicts(prev => prev.filter(c => c.id !== conflict.id));
      if (conflicts.length === 1) {
        setShowConflictModal(false);
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo resolver el conflicto.');
    }
  };

  const handleExport = async () => {
    const userId = isAuthenticated && user ? user.id : localUserId;
    if (!userId) {
      Alert.alert('Error', 'No se pudo identificar el usuario.');
      return;
    }

    setIsExporting(true);
    try {
      await exportData(userId);
      Alert.alert('Éxito', 'Datos exportados correctamente.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudieron exportar los datos.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    const userId = isAuthenticated && user ? user.id : localUserId;
    if (!userId) {
      Alert.alert('Error', 'No se pudo identificar el usuario.');
      return;
    }

    Alert.alert(
      'Importar Datos',
      '¿Estás seguro? Esto sobrescribirá tus datos existentes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          style: 'destructive',
          onPress: async () => {
            setIsImporting(true);
            try {
              const result = await importData(userId);
              Alert.alert(
                'Éxito',
                `Importados ${result.imported} elementos.${result.errors > 0 ? ` ${result.errors} error(es).` : ''}`
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'No se pudieron importar los datos.');
            } finally {
              setIsImporting(false);
            }
          },
        },
      ]
    );
  };

  const handleSyncFrequencyChange = async (newFrequency: 'daily' | 'weekly' | 'monthly') => {
    try {
      await setSyncFrequency(newFrequency);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo actualizar la frecuencia de sincronización.');
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Hace unos minutos';
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
        <Text className="text-2xl font-bold text-text-primary">
          Ajustes
        </Text>

        <TouchableOpacity onPress={() => router.push('/notifications')} className="h-10 w-10 items-center justify-center rounded-full bg-background">
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

        {/* Sincronización */}
        {isAuthenticated && (
          <SettingsSection title="Sincronización">
            <SyncFrequencyPicker
              value={frequency}
              onChange={handleSyncFrequencyChange}
            />
            <SettingsItem
              icon="Cloud"
              iconBg="bg-blue-100"
              iconColor="text-blue-500"
              title="Sincronizar Ahora"
              subtitle={isSyncing ? 'Sincronizando...' : `Última sincronización: ${formatLastSync()}`}
              onPress={handleSync}
              showDivider={false}
            />
            {pendingItems > 0 && (
              <View className="px-5 py-3 bg-yellow-50 border-t border-yellow-200">
                <Text className="text-xs font-medium text-yellow-700">
                  {pendingItems} elemento{pendingItems > 1 ? 's' : ''} pendiente{pendingItems > 1 ? 's' : ''} de sincronizar
                </Text>
              </View>
            )}
          </SettingsSection>
        )}

        {/* Datos */}
        <SettingsSection title="Datos">
          <SettingsItem
            icon="Download"
            iconBg="bg-orange-100"
            iconColor="text-orange-500"
            title="Exportar Datos"
            subtitle={isExporting ? 'Exportando...' : 'Guardar copia de seguridad'}
            onPress={handleExport}
            showDivider
          />
          <SettingsItem
            icon="Upload"
            iconBg="bg-blue-100"
            iconColor="text-blue-500"
            title="Importar Datos"
            subtitle={isImporting ? 'Importando...' : 'Restaurar desde archivo'}
            onPress={handleImport}
            showDivider={false}
          />
        </SettingsSection>

        {/* Reset */}
        <SettingsSection title="Opciones Avanzadas">
          <SettingsItem
            icon="RefreshCcw"
            iconBg="bg-gray-100"
            iconColor="text-gray-500"
            title="Reiniciar Datos"
            subtitle="Eliminar todos los datos locales"
            onPress={handleReset}
            showDivider={false}
          />
        </SettingsSection>

        {/* Footer */}
        <View className="mt-10 items-center gap-3">
          {isAuthenticated && (
            <TouchableOpacity className="w-full max-w-[200px] py-5 font-bold text-sm bg-red-100 rounded-full transition-colors" onPress={handleLogout}>
              <Text className="text-center text-base font-bold text-red-500">
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          )}

          <Text className="text-sm font-medium text-text-muted">
            Versión {version}
          </Text>
        </View>
      </ScrollView>

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        visible={showConflictModal}
        conflicts={conflicts}
        onResolve={handleResolveConflict}
        onClose={() => setShowConflictModal(false)}
      />
    </View>
  );
}
