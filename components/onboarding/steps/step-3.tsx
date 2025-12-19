import { useOnboarding } from '@/context/OnboardingContext';
import { colors } from '@/utils/colors';
import { Check } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function Step3() {
  const { data, updateData } = useOnboarding();
  const [wantsPregnancy, setWantsPregnancy] = useState<boolean | undefined>(data.wantsPregnancy);

  useEffect(() => {
    if (wantsPregnancy !== undefined) {
      updateData({ wantsPregnancy });
    }
  }, [wantsPregnancy]);

  return (
    <View style={{ flex: 1 }}>
      {/* Headline Group */}
      <View className='mb-8'>
        <Text className='text-3xl font-bold tracking-tight text-text-primary mb-2'>
          ¿Buscas un embarazo?
        </Text>
        <Text className='text-text-muted text-base leading-relaxed'>
          Personalizaremos tu calendario y predicciones según tu objetivo actual. Este paso es opcional.
        </Text>
      </View>

      {/* Selection Cards */}
      <View className='gap-4 mb-6'>
        {/* Option 1: Yes */}
        <Pressable
          onPress={() => setWantsPregnancy(true)}
          className={`flex flex-row items-center gap-5 p-5 rounded-lg bg-white 
            border-2  ${wantsPregnancy === true ? 'border-primary' : 'border-gray-200'}`}
        >
          {/* Icon Box */}
          <View
            className='size-14 rounded-full bg-secondary/30 items-center justify-center'>
            <Text className='text-2xl'>👶</Text>
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
          <View
            className={`size-6 rounded-full border-2 
               flex items-center justify-center transition-colors ${wantsPregnancy === true ? 'border-primary bg-primary' : 'border-gray-300 bg-transparent'}`}
          >
            {wantsPregnancy === true && (
              <Check size={20} color={colors.moonWhite} strokeWidth={4} />
            )}
          </View>
        </Pressable>

        <Pressable
          onPress={() => setWantsPregnancy(false)}
          className={`flex flex-row items-center gap-5 p-5 rounded-lg bg-white 
            border-2  ${wantsPregnancy === false ? 'border-primary' : 'border-gray-200'}`}
        >
          <View
            className='size-14 rounded-full bg-primary/30 items-center justify-center'>
            <Text className='text-2xl'>📅</Text>
          </View>

          <View className='flex-1 gap-1'>
            <Text className='text-lg font-bold text-text-primary'>No, solo monitorear</Text>
            <Text className='text-sm text-text-muted'>Controlar mi ciclo y salud</Text>
          </View>

          <View
            className={`size-6 rounded-full border-2 
               flex items-center justify-center transition-colors ${wantsPregnancy === false ? 'border-primary bg-primary' : 'border-gray-300 bg-transparent'}`}
          >
            {wantsPregnancy === false && (
              // <Text className='text-white text-base font-bold'>✓</Text>
              <Check size={20} color={colors.moonWhite} strokeWidth={4} />
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}
