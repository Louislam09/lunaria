import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { presentPaywall as presentRevenueCatPaywall, PaywallOptions } from 'react-native-purchases-ui';
import { usePremium } from '@/hooks/usePremium';
import { useAlert } from '@/context/AlertContext';
import { colors } from '@/utils/colors';
import MyIcon from '@/components/ui/Icon';

interface RevenueCatPaywallProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseComplete?: () => void;
}

/**
 * RevenueCat Paywall Component using react-native-purchases-ui
 * This provides a pre-built paywall UI from RevenueCat
 */
export function RevenueCatPaywall({ 
  visible, 
  onClose, 
  onPurchaseComplete 
}: RevenueCatPaywallProps) {
  const { offerings, refreshStatus } = usePremium();
  const { alertError, alertSuccess } = useAlert();
  const [isPresenting, setIsPresenting] = useState(false);

  const handlePresentPaywall = async () => {
    if (!offerings?.current) {
      alertError('Error', 'No hay ofertas disponibles en este momento');
      return;
    }

    try {
      setIsPresenting(true);

      // Configure paywall options
      const paywallOptions: PaywallOptions = {
        // Customize the paywall appearance
        displayCloseButton: true,
        // You can customize colors, fonts, etc. here
      };

      // Present the RevenueCat Paywall
      const { customerInfo } = await presentRevenueCatPaywall({
        offering: offerings.current,
        ...paywallOptions,
      });

      // Check if purchase was successful
      const hasPremium = customerInfo.entitlements.active['Lunaria Pro'] !== undefined;
      
      if (hasPremium) {
        await refreshStatus();
        alertSuccess('¡Bienvenida a Premium!', 'Disfruta de todas las funciones premium');
        onPurchaseComplete?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Paywall error:', error);
      
      if (error.userCancelled || error.code === 'PURCHASE_CANCELLED') {
        // User cancelled, don't show error
        return;
      }
      
      alertError('Error', error.message || 'No se pudo completar la compra. Intenta más tarde.');
    } finally {
      setIsPresenting(false);
    }
  };

  useEffect(() => {
    if (visible && offerings?.current && !isPresenting) {
      // Small delay to ensure modal is fully visible
      setTimeout(() => {
        handlePresentPaywall();
      }, 300);
    }
  }, [visible, offerings]);

  if (!offerings?.current) {
    return (
      <Modal
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
        transparent
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-4">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-text-primary mb-2 text-center">
              Cargando...
            </Text>
            <ActivityIndicator size="large" color={colors.lavender} />
            <TouchableOpacity
              onPress={onClose}
              className="mt-4 py-3 rounded-2xl bg-gray-100"
            >
              <Text className="text-center font-semibold text-text-primary">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // The actual paywall UI is handled by RevenueCat
  // This component just triggers it
  return null;
}

