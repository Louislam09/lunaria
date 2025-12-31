import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MyIcon from '@/components/ui/Icon';
import { usePremium } from '@/hooks/usePremium';
import { PremiumModal } from '@/components/premium/PremiumModal';
import { CustomerCenter } from '@/components/premium/CustomerCenter';
import { SettingsItem } from './SettingsItem';
import { colors } from '@/utils/colors';

export function PremiumSection() {
  const { isPremium, isLoading, customerInfo, restore } = usePremium();
  const [showModal, setShowModal] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    try {
      setIsRestoring(true);
      await restore();
    } catch (error) {
      console.error('Error restoring:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  if (isLoading) {
    return (
      <View className="px-4 py-6 items-center">
        <ActivityIndicator size="small" color={colors.lavender} />
      </View>
    );
  }

  if (isPremium) {
    return (
      <View>
        <View className="px-4 mb-4">
          <View className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-5 border border-primary/20">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
                <MyIcon name="Sparkles" className="text-primary" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-text-primary">
                  Lunaria Premium
                </Text>
                <Text className="text-sm text-text-muted">
                  Activa
                </Text>
              </View>
            </View>
            {customerInfo?.entitlements.active.premium?.expirationDate && (
              <Text className="text-xs text-text-muted">
                Renovación: {new Date(customerInfo.entitlements.active.premium.expirationDate).toLocaleDateString('es-ES')}
              </Text>
            )}
          </View>
        </View>

        <SettingsItem
          icon="RotateCcw"
          iconBg="bg-blue-100"
          iconColor="text-blue-500"
          title="Restaurar compras"
          subtitle={isRestoring ? 'Restaurando...' : 'Restaurar suscripción'}
          onPress={handleRestore}
          disabled={isRestoring}
          showDivider
        />

        {/* Customer Center */}
        <View className="px-4 mt-4">
          <CustomerCenter />
        </View>
      </View>
    );
  }

  return (
    <View>
      <View className="px-4 mb-4">
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-5 border border-primary/20"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center gap-3 mb-2">
            <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
              <MyIcon name="Sparkles" className="text-primary" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-text-primary">
                Actualiza a Premium
              </Text>
              <Text className="text-sm text-text-muted">
                Desbloquea todas las funciones avanzadas
              </Text>
            </View>
            <MyIcon name="ChevronRight" className="text-primary" />
          </View>
          <View className="flex-row flex-wrap gap-2 mt-2">
            <View className="bg-primary/20 px-2 py-1 rounded-full">
              <Text className="text-xs font-semibold text-primary">Análisis Avanzado</Text>
            </View>
            <View className="bg-primary/20 px-2 py-1 rounded-full">
              <Text className="text-xs font-semibold text-primary">Reportes PDF</Text>
            </View>
            <View className="bg-primary/20 px-2 py-1 rounded-full">
              <Text className="text-xs font-semibold text-primary">Síntomas Ilimitados</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <SettingsItem
        icon="RotateCcw"
        iconBg="bg-blue-100"
        iconColor="text-blue-500"
        title="Restaurar compras"
        subtitle="Restaurar suscripción anterior"
        onPress={handleRestore}
        disabled={isRestoring}
        showDivider={false}
      />

      <PremiumModal visible={showModal} onClose={() => setShowModal(false)} />
    </View>
  );
}

