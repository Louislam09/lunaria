import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { usePremium } from '@/hooks/usePremium';
import { useAlert } from '@/context/AlertContext';
import MyIcon from '@/components/ui/Icon';
import { colors } from '@/utils/colors';

/**
 * Customer Center Component
 * Allows users to manage their subscriptions
 */
export function CustomerCenter() {
  const { customerInfo, isPremium } = usePremium();
  const { alertError, alertSuccess } = useAlert();
  const [isLoading, setIsLoading] = useState(false);

  const openCustomerCenter = async () => {
    try {
      setIsLoading(true);

      if (Platform.OS === 'ios') {
        // iOS: Open App Store subscription management
        const url = 'https://apps.apple.com/account/subscriptions';
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          alertError('Error', 'No se pudo abrir la gestión de suscripciones');
        }
      } else if (Platform.OS === 'android') {
        // Android: Open Play Store subscription management
        const url = 'https://play.google.com/store/account/subscriptions';
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          // Try alternative method
          const playStoreUrl = `https://play.google.com/store/account/subscriptions?package=${Platform.select({
            android: 'com.louislam09.lunaria', // Replace with your package name
          })}`;
          await Linking.openURL(playStoreUrl);
        }
      }
    } catch (error: any) {
      console.error('Error opening customer center:', error);
      alertError('Error', 'No se pudo abrir la gestión de suscripciones');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPremium) {
    return null;
  }

  const expirationDate = customerInfo?.entitlements.active['Lunaria Pro']?.expirationDate;
  const productIdentifier = customerInfo?.entitlements.active['Lunaria Pro']?.productIdentifier;

  return (
    <View className="bg-white rounded-3xl p-5 border border-gray-200 shadow-md">
      <View className="flex-row items-center gap-3 mb-4">
        <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
          <MyIcon name="Settings" className="text-blue-500" size={20} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-text-primary">
            Gestionar Suscripción
          </Text>
          <Text className="text-sm text-text-muted">
            Administra tu suscripción de Lunaria Pro
          </Text>
        </View>
      </View>

      {expirationDate && (
        <View className="mb-4 p-3 bg-gray-50 rounded-2xl">
          <Text className="text-sm text-text-muted mb-1">Próxima renovación</Text>
          <Text className="text-base font-semibold text-text-primary">
            {new Date(expirationDate).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={openCustomerCenter}
        disabled={isLoading}
        className="bg-primary py-4 rounded-2xl items-center flex-row justify-center gap-2"
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <MyIcon name="ExternalLink" className="text-white" size={18} />
            <Text className="text-white font-bold text-base">
              Abrir gestión de suscripciones
            </Text>
          </>
        )}
      </TouchableOpacity>

      <Text className="text-xs text-text-muted text-center mt-3">
        Serás redirigido a {Platform.OS === 'ios' ? 'App Store' : 'Play Store'} para gestionar tu suscripción
      </Text>
    </View>
  );
}

