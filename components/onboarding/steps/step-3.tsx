import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/context/OnboardingContext';
import { colors } from '@/utils/colors';
import OnboardingProgress from '@/components/ui/OnboardingProgress';

export default function Step3() {
  const insets = useSafeAreaInsets();
  const { data, updateData } = useOnboarding();
  const [wantsPregnancy, setWantsPregnancy] = useState<boolean | undefined>(data.wantsPregnancy);

  useEffect(() => {
    if (wantsPregnancy !== undefined) {
      updateData({ wantsPregnancy });
    }
  }, [wantsPregnancy]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.moonWhite }}>
      {/* Top App Bar */}
      <View style={{ paddingTop: insets.top, backgroundColor: colors.moonWhite }}>
        <OnboardingProgress currentStep={3} />
      </View>

      {/* Main Scrollable Content */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 128, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
        {/* Headline Group */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 30, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary, marginBottom: 8 }}>
            ¿Buscas un embarazo?
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 16, lineHeight: 24 }}>
            Personalizaremos tu calendario y predicciones según tu objetivo actual. Este paso es opcional.
          </Text>
        </View>

        {/* Selection Cards */}
        <View style={{ gap: 16, marginBottom: 24 }}>
          {/* Option 1: Yes */}
          <Pressable
            onPress={() => setWantsPregnancy(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              padding: 20,
              borderRadius: 16,
              backgroundColor: '#ffffff',
              borderWidth: wantsPregnancy === true ? 2 : 1,
              borderColor: wantsPregnancy === true ? colors.lavender : '#e2e8f0',
            }}
          >
            {/* Icon Box */}
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: `${colors.blush}33`,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 28 }}>👶</Text>
            </View>
            {/* Text Content */}
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                Sí, busco un embarazo
              </Text>
              <Text style={{ fontSize: 14, color: colors.textMuted }}>
                Quiero concebir pronto
              </Text>
            </View>
            {/* Check Indicator */}
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: wantsPregnancy === true ? colors.lavender : '#d1d5db',
              backgroundColor: wantsPregnancy === true ? colors.lavender : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {wantsPregnancy === true && (
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700' }}>✓</Text>
              )}
            </View>
          </Pressable>

          {/* Option 2: No */}
          <Pressable
            onPress={() => setWantsPregnancy(false)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              padding: 20,
              borderRadius: 16,
              backgroundColor: '#ffffff',
              borderWidth: wantsPregnancy === false ? 2 : 1,
              borderColor: wantsPregnancy === false ? colors.lavender : '#e2e8f0',
            }}
          >
            {/* Icon Box */}
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: `${colors.lavender}33`,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 28 }}>📅</Text>
            </View>
            {/* Text Content */}
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                No, solo monitorear
              </Text>
              <Text style={{ fontSize: 14, color: colors.textMuted }}>
                Controlar mi ciclo y salud
              </Text>
            </View>
            {/* Check Indicator */}
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: wantsPregnancy === false ? colors.lavender : '#d1d5db',
              backgroundColor: wantsPregnancy === false ? colors.lavender : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {wantsPregnancy === false && (
                <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700' }}>✓</Text>
              )}
            </View>
          </Pressable>
        </View>
        <View style={{ height: 200, backgroundColor: 'transparent', width: '100%' }} />
      </ScrollView>
    </View>
  );
}
