import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useOnboarding, ContraceptiveMethod } from '@/context/OnboardingContext';
import { colors } from '@/utils/colors';

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

export default function OnboardingContraceptiveScreen() {
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

  const handleSkip = () => {
    updateData({ contraceptiveMethod: undefined });
    handleFinish();
  };

  const handleFinish = () => {
    // The completion check happens automatically in updateData
    // Navigate to tabs - if onboarding is complete, index.tsx will handle it
    router.replace('/(tabs)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.moonWhite }}>
      {/* Top App Bar */}
      <View style={{ paddingTop: insets.top, backgroundColor: colors.moonWhite }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'space-between' }}>
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </Pressable>
          <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center', paddingRight: 40 }}>
            Paso 5 de 5
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textMuted }}>Método anticonceptivo</Text>
            <Text style={{ fontSize: 16, fontWeight: '500', color: colors.textMuted }}>100%</Text>
          </View>
          <View style={{ height: 4, width: '100%', borderRadius: 9999, backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: colors.lavender, borderRadius: 9999, width: '100%' }} />
          </View>
        </View>
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
        <View style={{ height: 160, backgroundColor: 'transparent', width: '100%' }} />
      </ScrollView>

      {/* Footer / Bottom Navigation */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.moonWhite,
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          padding: 16,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={handleSkip}
            style={{
              flex: 1,
              height: 56,
              backgroundColor: 'transparent',
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.textMuted, fontSize: 18, fontWeight: '600' }}>Omitir</Text>
          </Pressable>
          <Pressable
            onPress={handleFinish}
            style={{
              flex: 1,
              height: 56,
              backgroundColor: colors.lavender,
              borderRadius: 9999,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700' }}>Finalizar</Text>
            <ArrowRight size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
