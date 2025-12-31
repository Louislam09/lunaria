import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import MyIcon from '@/components/ui/Icon';
import { usePremium } from '@/hooks/usePremium';
import { useAlert } from '@/context/AlertContext';
import { PurchasesPackage, PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { colors } from '@/utils/colors';
import { RevenueCatPaywall } from './RevenueCatPaywall';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
}

const PREMIUM_FEATURES = [
  {
    icon: 'BarChart',
    title: 'Análisis Avanzado',
    description: 'Gráficos y tendencias detalladas de tu ciclo',
  },
  {
    icon: 'Sparkles',
    title: 'Predicciones con IA',
    description: 'Predicciones inteligentes basadas en tu historial',
  },
  {
    icon: 'FileText',
    title: 'Reportes de Salud',
    description: 'Exporta reportes PDF para compartir con tu médico',
  },
  {
    icon: 'Plus',
    title: 'Síntomas Extendidos',
    description: 'Síntomas ilimitados y personalizados',
  },
  {
    icon: 'Users',
    title: 'Compartir con Pareja',
    description: 'Comparte tu ciclo con tu pareja',
  },
  {
    icon: 'Download',
    title: 'Exportación Avanzada',
    description: 'Exporta a CSV, Excel y más formatos',
  },
];

export function PremiumModal({ visible, onClose }: PremiumModalProps) {
  const { offerings, purchase, restore, isLoading } = usePremium();
  const { alertError, alertSuccess } = useAlert();
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [useRevenueCatPaywall, setUseRevenueCatPaywall] = useState(false);

  useEffect(() => {
    if (offerings && offerings.availablePackages.length > 0) {
      // Prefer monthly, then annual, then lifetime
      const monthly = offerings.availablePackages.find(pkg => pkg.packageType === 'MONTHLY');
      const annual = offerings.availablePackages.find(pkg => pkg.packageType === 'ANNUAL');
      const lifetime = offerings.availablePackages.find(pkg => pkg.packageType === 'LIFETIME');

      setSelectedPackage(monthly || annual || lifetime || offerings.availablePackages[0]);
    }
  }, [offerings]);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      alertError('Error', 'No hay paquetes disponibles');
      return;
    }

    try {
      setIsPurchasing(true);
      await purchase(selectedPackage);
      alertSuccess('¡Bienvenida a Premium!', 'Disfruta de todas las funciones premium');
      onClose();
    } catch (error: any) {
      // Handle specific error codes
      if (error.message === 'PURCHASE_CANCELLED' || error.userCancelled) {
        // User cancelled, don't show error
        return;
      }
      
      const errorCode = error?.code;
      
      if (errorCode === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return; // User cancelled
      }
      
      if (errorCode === PURCHASES_ERROR_CODE.NETWORK_ERROR) {
        alertError('Error de conexión', 'Verifica tu conexión a internet e intenta nuevamente');
        return;
      }
      
      if (errorCode === PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR) {
        alertError('Error', 'Las compras no están permitidas en este dispositivo');
        return;
      }
      
      alertError('Error', error.message || 'No se pudo completar la compra. Intenta más tarde.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleUseRevenueCatPaywall = () => {
    setUseRevenueCatPaywall(true);
  };

  const handleRestore = async () => {
    try {
      setIsPurchasing(true);
      await restore();
      alertSuccess('Éxito', 'Compras restauradas correctamente');
      onClose();
    } catch (error: any) {
      alertError('Error', error.message || 'No se pudieron restaurar las compras');
    } finally {
      setIsPurchasing(false);
    }
  };

  const formatPrice = (packageToFormat: PurchasesPackage) => {
    return packageToFormat.product.priceString;
  };

  const getPackageLabel = (packageToLabel: PurchasesPackage) => {
    switch (packageToLabel.packageType) {
      case 'MONTHLY':
        return 'Mensual';
      case 'ANNUAL':
        return 'Anual';
      case 'LIFETIME':
        return 'De por vida';
      default:
        return 'Premium';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-end bg-black/50"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full bg-white rounded-t-3xl max-h-[90%]"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="px-6 pt-6 pb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
                    <MyIcon name="Sparkles" className="text-primary" size={24} />
                  </View>
                  <Text className="text-2xl font-bold text-text-primary">
                    Lunaria Premium
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} className="w-8 h-8 items-center justify-center">
                  <MyIcon name="X" className="text-text-muted" size={20} />
                </TouchableOpacity>
              </View>
              <Text className="text-base text-text-muted">
                Desbloquea todas las funciones avanzadas y lleva el seguimiento de tu ciclo al siguiente nivel
              </Text>
            </View>

            {/* Features List */}
            <View className="px-6 pb-4">
              {PREMIUM_FEATURES.map((feature, index) => (
                <View key={index} className="flex-row items-start gap-3 mb-4">
                  <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mt-1">
                    <MyIcon name={feature.icon as any} className="text-primary" size={20} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-text-primary mb-1">
                      {feature.title}
                    </Text>
                    <Text className="text-sm text-text-muted">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Pricing Options */}
            {isLoading ? (
              <View className="px-6 py-8 items-center">
                <ActivityIndicator size="large" color={colors.lavender} />
                <Text className="text-text-muted mt-4">Cargando opciones...</Text>
              </View>
            ) : offerings && offerings.availablePackages.length > 0 ? (
              <View className="px-6 pb-4">
                <Text className="text-lg font-bold text-text-primary mb-3">
                  Elige tu plan
                </Text>
                <View className="gap-3">
                  {offerings.availablePackages.map((pkg, index) => {
                    const isSelected = selectedPackage?.identifier === pkg.identifier;
                    const isAnnual = pkg.packageType === 'ANNUAL';
                    const isLifetime = pkg.packageType === 'LIFETIME';

                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => setSelectedPackage(pkg)}
                        className={`rounded-2xl p-4 border-2 ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 bg-white'
                        }`}
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                              <Text className="text-base font-bold text-text-primary">
                                {getPackageLabel(pkg)}
                              </Text>
                              {(isAnnual || isLifetime) && (
                                <View className="bg-green-100 px-2 py-0.5 rounded-full">
                                  <Text className="text-xs font-bold text-green-600">
                                    MEJOR VALOR
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text className="text-sm text-text-muted">
                              {formatPrice(pkg)}
                            </Text>
                          </View>
                          {isSelected && (
                            <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                              <MyIcon name="Check" className="text-white" size={16} />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View className="px-6 py-4">
                <Text className="text-text-muted text-center">
                  No hay paquetes disponibles en este momento
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="px-6 pb-6 pt-4 gap-3">
              {selectedPackage && (
                <TouchableOpacity
                  onPress={handlePurchase}
                  disabled={isPurchasing}
                  className={`py-4 rounded-2xl items-center ${
                    isPurchasing ? 'bg-gray-400' : 'bg-primary'
                  }`}
                  activeOpacity={0.8}
                >
                  {isPurchasing ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      Suscribirse ahora
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleRestore}
                disabled={isPurchasing}
                className="py-3 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-primary font-semibold text-base">
                  Restaurar compras
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUseRevenueCatPaywall}
                className="py-2 items-center"
                activeOpacity={0.7}
              >
                <Text className="text-primary font-semibold text-sm">
                  Usar paywall de RevenueCat
                </Text>
              </TouchableOpacity>

              <Text className="text-xs text-text-muted text-center px-4">
                La suscripción se renovará automáticamente. Puedes cancelar en cualquier momento desde la configuración de tu cuenta.
              </Text>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>

      {/* RevenueCat Paywall */}
      <RevenueCatPaywall
        visible={useRevenueCatPaywall}
        onClose={() => {
          setUseRevenueCatPaywall(false);
          onClose();
        }}
        onPurchaseComplete={() => {
          setUseRevenueCatPaywall(false);
        }}
      />
    </Modal>
  );
}

