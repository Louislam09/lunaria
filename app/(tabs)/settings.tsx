import { ConflictResolutionModal } from '@/components/settings/ConflictResolutionModal';
import { ProfileCard } from '@/components/settings/ProfileCard';
import { SettingsItem } from '@/components/settings/SettingsItem';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { SyncFrequencyPicker } from '@/components/settings/SyncFrequencyPicker';
import { TimePicker } from '@/components/settings/TimePicker';
import { ToggleRow } from '@/components/settings/ToggleRow';
import MyIcon from '@/components/ui/Icon';
import { Paywall } from '@/components/revenuecat/Paywall';
import { CustomerCenter } from '@/components/revenuecat/CustomerCenter';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/AlertContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { useSync } from '@/context/SyncContext';
import { useRevenueCat } from '@/context/RevenueCatContext';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { Conflict, detectConflicts, resolveConflictLocal, resolveConflictRemote } from '@/services/conflictResolution';
import { exportData, importData } from '@/services/exportImport';
import { sendTestNotification, getAllScheduledNotifications } from '@/services/notifications';
import { formatDate } from '@/utils/dates';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export default function SettingsScreen() {
  const version = Constants.expoConfig?.version;
  const { data, reset, isLoading, isComplete, updateData } = useOnboarding();
  const { user, logout, isAuthenticated, localUserId } = useAuth();
  const { sync, setSyncFrequency, frequency, pendingItems, lastSyncTime, isSyncing } = useSync();
  const { alertError, alertSuccess, alertWarning, confirm, actionSheet } = useAlert();
  const { isPro, isLoading: isLoadingRevenueCat } = useRevenueCat();
  const { averageCycleLength = 28, cycleRangeMin, cycleRangeMax, periodLength = 5 } = data;
  const [aiPredictionEnabled, setAiPredictionEnabled] = useState(true);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [showLastPeriodPicker, setShowLastPeriodPicker] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showCustomerCenter, setShowCustomerCenter] = useState(false);

  // Notification manager
  const {
    preferences,
    updatePreferences,
    isScheduling,
  } = useNotificationManager();

  // Load scheduled notification count
  useEffect(() => {
    loadScheduledCount();
  }, []);

  const loadScheduledCount = async () => {
    try {
      const scheduled = await getAllScheduledNotifications();
      setScheduledCount(scheduled.length);
    } catch (error) {
      console.error('Error loading scheduled count:', error);
    }
  };

  const userName = data.name || user?.name || 'Usuario';
  const userEmail = user?.email || ' ';

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (!isLoading && !isComplete) {
      router.replace('/onboarding/wizard');
    }
  }, [isLoading, isComplete]);

  const handleLogout = async () => {
    confirm(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      async () => {
        try {
          await logout();
          // Navigate directly to splash screen
          router.replace('/splash');
        } catch (error) {
          console.error('Logout error:', error);
          alertError('Error', 'No se pudo cerrar sesión');
        }
      }
    );
  };

  const handleReset = async () => {
    confirm(
      'Reiniciar Datos',
      '¿Estás seguro? Esto eliminará todos tus datos locales y te llevará al inicio.',
      async () => {
        try {
          await reset();
          // Navigate directly to splash screen
          router.replace('/splash');
        } catch (error) {
          console.error('Reset error:', error);
          alertError('Error', 'No se pudieron reiniciar los datos');
        }
      }
    );
  };

  const handleSync = async () => {
    if (!isAuthenticated || !user) {
      alertWarning('Autenticación requerida', 'Debes iniciar sesión para sincronizar tus datos.');
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
        alertSuccess('Éxito', 'Datos sincronizados correctamente.');
      }
    } catch (error: any) {
      alertError('Error', error.message || 'No se pudo sincronizar. Intenta más tarde.');
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
      alertError('Error', 'No se pudo resolver el conflicto.');
    }
  };

  const handleExport = async () => {
    const userId = isAuthenticated && user ? user.id : localUserId;
    if (!userId) {
      alertError('Error', 'No se pudo identificar el usuario.');
      return;
    }

    setIsExporting(true);
    try {
      await exportData(userId);
      alertSuccess('Éxito', 'Datos exportados correctamente.');
    } catch (error: any) {
      alertError('Error', error.message || 'No se pudieron exportar los datos.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    const userId = isAuthenticated && user ? user.id : localUserId;
    if (!userId) {
      alertError('Error', 'No se pudo identificar el usuario.');
      return;
    }

    confirm(
      'Importar Datos',
      '¿Estás seguro? Esto sobrescribirá tus datos existentes.',
      async () => {
        setIsImporting(true);
        try {
          const result = await importData(userId);
          alertSuccess(
            'Éxito',
            `Importados ${result.imported} elementos.${result.errors > 0 ? ` ${result.errors} error(es).` : ''}`
          );
        } catch (error: any) {
          alertError('Error', error.message || 'No se pudieron importar los datos.');
        } finally {
          setIsImporting(false);
        }
      }
    );
  };

  const handleSyncFrequencyChange = async (newFrequency: 'daily' | 'weekly' | 'monthly') => {
    try {
      await setSyncFrequency(newFrequency);
    } catch (error: any) {
      alertError('Error', 'No se pudo actualizar la frecuencia de sincronización.');
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Nunca';
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 0 ? 's' : ''}`;
    return 'Hace unos minutos';
  };

  const handlePickImage = async () => {
    if (isPickingImage) return;

    try {
      setIsPickingImage(true);

      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alertWarning('Permisos requeridos', 'Necesitamos acceso a tu galería para seleccionar una foto de perfil.');
        return;
      }

      // Show action sheet to choose between camera and gallery
      actionSheet(
        'Seleccionar foto de perfil',
        '¿De dónde deseas seleccionar la foto?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => { },
          },
          {
            text: 'Galería',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
              });

              if (!result.canceled && result.assets[0]) {
                await saveAvatarImage(result.assets[0].uri);
              }
            },
          },
          {
            text: 'Cámara',
            onPress: async () => {
              // Request camera permissions
              const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
              if (cameraPermission.status !== 'granted') {
                alertWarning('Permisos requeridos', 'Necesitamos acceso a tu cámara para tomar una foto.');
                return;
              }

              const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                await saveAvatarImage(result.assets[0].uri);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error picking image:', error);
      alertError('Error', 'No se pudo seleccionar la imagen. Intenta más tarde.');
    } finally {
      setIsPickingImage(false);
    }
  };

  const saveAvatarImage = async (imageUri: string) => {
    try {
      // Use the image URI directly - React Native can handle file:// URIs
      // For better persistence, we'll store the URI as-is
      // The image picker returns a URI that's accessible to the app

      // Update avatar URL in onboarding data
      await updateData({ avatarUrl: imageUri });

      alertSuccess('Éxito', 'Foto de perfil actualizada correctamente.');
    } catch (error: any) {
      console.error('Error saving avatar:', error);
      alertError('Error', 'No se pudo guardar la foto de perfil. Intenta más tarde.');
    }
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
          avatarUrl={data.avatarUrl}
          isPremium={isPro}
          onEditPress={handlePickImage}
        />

        {/* Suscripción */}
        <SettingsSection title="Suscripción">
          <SettingsItem
            icon="Crown"
            iconBg="bg-yellow-100"
            iconColor="text-yellow-500"
            title="Lunaria Pro"
            subtitle={isPro ? 'Activa' : 'Desbloquea todas las funciones'}
            onPress={() => setShowPaywall(true)}
            showDivider={isPro}
          />
          {isPro && (
            <SettingsItem
              icon="Settings"
              iconBg="bg-blue-100"
              iconColor="text-blue-500"
              title="Gestionar Suscripción"
              subtitle="Ver y administrar tu suscripción"
              onPress={() => setShowCustomerCenter(true)}
              showDivider={false}
            />
          )}
        </SettingsSection>

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
            showChevron={true}
            onPress={() => setShowLastPeriodPicker(true)}
          />
          {showLastPeriodPicker && (
            <>
              <DateTimePicker
                value={data.lastPeriodStart || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  if (Platform.OS === 'android') {
                    setShowLastPeriodPicker(false);
                  }
                  if (event.type !== 'dismissed' && selectedDate) {
                    updateData({ lastPeriodStart: selectedDate });
                  }
                }}
                maximumDate={new Date()}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  onPress={() => setShowLastPeriodPicker(false)}
                  className="mx-5 mt-2 p-3 bg-gray-100 rounded-lg"
                >
                  <Text className="text-center font-bold text-text-primary">Listo</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </SettingsSection>

        {/* Notificaciones */}
        <SettingsSection title="Notificaciones">
          <ToggleRow
            icon="Bell"
            iconBg="bg-pink-100"
            iconColor="text-pink-500"
            title="Activar notificaciones"
            subtitle={scheduledCount > 0 ? `${scheduledCount} programada${scheduledCount > 1 ? 's' : ''}` : 'Activar recordatorios'}
            value={preferences?.enabled ?? false}
            onChange={async (enabled) => {
              await updatePreferences({ enabled });
              await loadScheduledCount();
            }}
          />

          {/* Period Reminders */}
          {preferences?.enabled && (
            <>
              <View className="px-5 py-3 bg-gray-50">
                <ToggleRow
                  icon="Calendar"
                  iconBg="bg-blue-100"
                  iconColor="text-blue-500"
                  title="Recordatorios de periodo"
                  subtitle={preferences.periodReminders.enabled ? 'Activado' : 'Desactivado'}
                  value={preferences.periodReminders.enabled}
                  onChange={async (enabled) => {
                    await updatePreferences({
                      periodReminders: { ...preferences.periodReminders, enabled },
                    });
                    await loadScheduledCount();
                  }}
                  showDivider={false}
                />

                {preferences.periodReminders.enabled && (
                  <>
                    <View className="mb-3">
                      <Text className="text-xs font-semibold text-text-muted mb-2">
                        Días antes:
                      </Text>
                      <View className="flex-row gap-2">
                        {[3, 2, 1].map((day) => (
                          <TouchableOpacity
                            key={day}
                            onPress={async () => {
                              const daysBefore = preferences.periodReminders.daysBefore.includes(day)
                                ? preferences.periodReminders.daysBefore.filter((d) => d !== day)
                                : [...preferences.periodReminders.daysBefore, day].sort((a, b) => b - a);
                              await updatePreferences({
                                periodReminders: { ...preferences.periodReminders, daysBefore },
                              });
                              await loadScheduledCount();
                            }}
                            className={`px-4 py-2 rounded-xl border ${preferences.periodReminders.daysBefore.includes(day)
                              ? 'bg-blue-100 border-blue-300'
                              : 'bg-white border-gray-200'
                              }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${preferences.periodReminders.daysBefore.includes(day)
                                ? 'text-blue-600'
                                : 'text-text-muted'
                                }`}
                            >
                              {day} día{day > 1 ? 's' : ''}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View>
                      <Text className="text-xs font-semibold text-text-muted mb-2">
                        Hora:
                      </Text>
                      <TimePicker
                        value={preferences.periodReminders.time}
                        onChange={async (time) => {
                          await updatePreferences({
                            periodReminders: { ...preferences.periodReminders, time },
                          });
                          await loadScheduledCount();
                        }}
                        disabled={!preferences.periodReminders.enabled}
                      />
                    </View>
                  </>
                )}
              </View>

              {/* Fertile Window */}
              <View className="px-5 py-3 bg-gray-50 border-t border-gray-200">
                <ToggleRow
                  icon="Baby"
                  iconBg="bg-purple-100"
                  iconColor="text-purple-500"
                  title="Ventana fértil"
                  subtitle={preferences.fertileWindowReminders.enabled ? 'Activado' : 'Desactivado'}
                  value={preferences.fertileWindowReminders.enabled}
                  onChange={async (enabled) => {
                    await updatePreferences({
                      fertileWindowReminders: { ...preferences.fertileWindowReminders, enabled },
                    });
                    await loadScheduledCount();
                  }}
                  showDivider={false}
                />

                {preferences.fertileWindowReminders.enabled && (
                  <View>
                    <Text className="text-xs font-semibold text-text-muted mb-2">
                      Hora:
                    </Text>
                    <TimePicker
                      value={preferences.fertileWindowReminders.time}
                      onChange={async (time) => {
                        await updatePreferences({
                          fertileWindowReminders: { ...preferences.fertileWindowReminders, time },
                        });
                        await loadScheduledCount();
                      }}
                      disabled={!preferences.fertileWindowReminders.enabled}
                    />
                  </View>
                )}
              </View>

              {/* Drug Reminder */}
              <View className="px-5 py-3 bg-gray-50 border-t border-gray-200">
                <ToggleRow
                  icon="Pill"
                  iconBg="bg-red-100"
                  iconColor="text-red-500"
                  title="Recordatorio de medicamentos"
                  subtitle={preferences.dailyLogReminder.enabled ? 'Activado' : 'Desactivado'}
                  value={preferences.dailyLogReminder.enabled}
                  onChange={async (enabled) => {
                    await updatePreferences({
                      dailyLogReminder: { ...preferences.dailyLogReminder, enabled },
                    });
                    await loadScheduledCount();
                  }}
                  showDivider={false}
                />

                {preferences.dailyLogReminder.enabled && (
                  <View>
                    <Text className="text-xs font-semibold text-text-muted mb-2">
                      Hora:
                    </Text>
                    <TimePicker
                      value={preferences.dailyLogReminder.time}
                      onChange={async (time) => {
                        await updatePreferences({
                          dailyLogReminder: { ...preferences.dailyLogReminder, time },
                        });
                        await loadScheduledCount();
                      }}
                      disabled={!preferences.dailyLogReminder.enabled}
                    />
                  </View>
                )}
              </View>

              {/* Test Notification Button */}
              <TouchableOpacity
                onPress={async () => {
                  setIsLoadingNotifications(true);
                  try {
                    await sendTestNotification();
                    alertSuccess('Éxito', 'Notificación de prueba enviada.');
                    await loadScheduledCount();
                  } catch (error: any) {
                    alertError('Error', error.message || 'No se pudo enviar la notificación de prueba.');
                  } finally {
                    setIsLoadingNotifications(false);
                  }
                }}
                disabled={isLoadingNotifications || isScheduling}
                className="mx-5 my-3 px-4 py-3 bg-primary/10 rounded-3xl border border-primary/20"
              >
                <Text className="text-center text-sm font-semibold text-primary">
                  {isLoadingNotifications ? 'Enviando...' : 'Enviar notificación de prueba'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </SettingsSection>

        {/* Preferencias */}
        <SettingsSection title="Preferencias">
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

      {/* RevenueCat Paywall */}
      <Paywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onPurchaseComplete={() => {
          setShowPaywall(false);
        }}
      />

      {/* RevenueCat Customer Center */}
      <CustomerCenter
        visible={showCustomerCenter}
        onClose={() => setShowCustomerCenter(false)}
      />
    </View>
  );
}
