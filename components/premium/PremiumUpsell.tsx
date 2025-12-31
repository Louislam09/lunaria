import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MyIcon from '@/components/ui/Icon';
import { PremiumModal } from './PremiumModal';
import { usePremium } from '@/hooks/usePremium';

interface PremiumUpsellProps {
  title: string;
  description: string;
  features?: string[];
  onDismiss?: () => void;
}

export function PremiumUpsell({ title, description, features, onDismiss }: PremiumUpsellProps) {
  const { isPremium } = usePremium();
  const [showModal, setShowModal] = React.useState(false);

  if (isPremium) {
    return null;
  }

  return (
    <>
      <View className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-5 border border-primary/20 mb-4">
        <View className="flex-row items-start gap-3 mb-3">
          <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mt-1">
            <MyIcon name="Sparkles" className="text-primary" size={20} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-text-primary mb-1">
              {title}
            </Text>
            <Text className="text-sm text-text-muted mb-3">
              {description}
            </Text>
            {features && features.length > 0 && (
              <View className="gap-2 mb-3">
                {features.map((feature, index) => (
                  <View key={index} className="flex-row items-center gap-2">
                    <MyIcon name="Check" className="text-primary" size={16} />
                    <Text className="text-sm text-text-primary">{feature}</Text>
                  </View>
                ))}
              </View>
            )}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowModal(true)}
                className="flex-1 bg-primary py-3 rounded-2xl items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-base">Actualizar ahora</Text>
              </TouchableOpacity>
              {onDismiss && (
                <TouchableOpacity
                  onPress={onDismiss}
                  className="px-4 py-3 rounded-2xl items-center border border-gray-300"
                  activeOpacity={0.8}
                >
                  <Text className="text-text-muted font-semibold">Más tarde</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
      <PremiumModal visible={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}

