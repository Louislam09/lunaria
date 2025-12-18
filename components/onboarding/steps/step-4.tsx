import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding, ContraceptiveMethod } from '@/context/OnboardingContext';
import { colors } from '@/utils/colors';
import OnboardingProgress from '@/components/ui/OnboardingProgress';

const contraceptiveMethods: { id: ContraceptiveMethod; label: string; icon: string }[] = [
  { id: 'none', label: 'Ninguno', icon: '🚫' },
  { id: 'condom', label: 'Condón', icon: '🛡️' },
  { id: 'pill', label: 'Pastillas', icon: '💊' },
  { id: 'injection', label: 'Inyección', icon: '💉' },
  { id: 'implant', label: 'Implante', icon: '📏' },
  { id: 'iud_hormonal', label: 'DIU hormonal', icon: '⚓' },
  { id: 'iud_copper', label: 'DIU de cobre', icon: '⚓' },
  { id: 'other', label: 'Otro', icon: '➕' },
];

export default function Step4() {
  const insets = useSafeAreaInsets();
  const { data, updateData } = useOnboarding();
  const [selectedMethod, setSelectedMethod] = useState<ContraceptiveMethod | undefined>(
    data.contraceptiveMethod || 'none'
  );

  useEffect(() => {
    if (selectedMethod !== undefined) {
      updateData({ contraceptiveMethod: selectedMethod });
    }
  }, [selectedMethod]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.moonWhite }}>
      {/* Top App Bar */}
      <View style={{ paddingTop: insets.top, backgroundColor: colors.moonWhite }}>
        <OnboardingProgress currentStep={4} />
      </View>

      {/* Main Scrollable Content */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 128, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
        {/* Text Section */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 30, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary, marginBottom: 8 }}>
            ¿Usas algún método anticonceptivo?
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 24 }}>
            Esto nos ayuda a mejorar tus predicciones y personalizar tu experiencia. Este paso es opcional.
          </Text>
        </View>

        {/* Options Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          {contraceptiveMethods.map((method) => (
            <Pressable
              key={method.id}
              onPress={() => setSelectedMethod(method.id)}
              style={{
                width: '48%',
                padding: 16,
                borderRadius: 16,
                backgroundColor: '#ffffff',
                borderWidth: selectedMethod === method.id ? 2 : 1,
                borderColor: selectedMethod === method.id ? colors.lavender : '#e2e8f0',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                position: 'relative',
              }}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: selectedMethod === method.id ? `${colors.lavender}1A` : '#f1f5f9',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Text style={{ fontSize: 24 }}>{method.icon}</Text>
              </View>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: selectedMethod === method.id ? colors.lavender : colors.textPrimary,
                textAlign: 'center',
              }}>
                {method.label}
              </Text>
              {selectedMethod === method.id && (
                <View style={{ position: 'absolute', top: 12, right: 12 }}>
                  <Text style={{ fontSize: 20, color: colors.lavender }}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
        <View style={{ height: 200, backgroundColor: 'transparent', width: '100%' }} />
      </ScrollView>
    </View>
  );
}
