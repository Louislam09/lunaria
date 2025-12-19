import { ContraceptiveMethod, useOnboarding } from '@/context/OnboardingContext';
import { colors } from '@/utils/colors';
import { Check } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

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
    <View style={{ flex: 1 }}>


      {/* Text Section */}
      <View className='mb-8'>
        <Text className='text-3xl font-bold tracking-tight text-text-primary mb-2'>
          ¿Usas algún método anticonceptivo?
        </Text>
        <Text className='text-text-muted text-base leading-relaxed'>
          Esto nos ayuda a mejorar tus predicciones y personalizar tu experiencia. Este paso es opcional.
        </Text>
      </View>

      {/* Options Grid */}
      <View className='flex-row flex-wrap gap-3 mb-6'>
        {contraceptiveMethods.map((method) => (
          <Pressable
            key={method.id}
            onPress={() => setSelectedMethod(method.id)}
            className={`w-[48%] p-4 rounded-2xl bg-white  border-2  ${selectedMethod === method.id ? 'border-primary' : 'border-gray-200'}   items-center justify-center`}
          >
            <View className={`size-12  rounded-full items-center justify-center ${selectedMethod === method.id ? 'bg-primary/80' : 'bg-gray-200'} mb-3`} >
              <Text className='text-2xl'>{method.icon}</Text>
            </View>
            <Text className='text-base font-medium text-text-primary text-center'  > {method.label}  </Text>

            <View
              className={`absolute top-3 right-3 size-6 rounded-full border-2 
               flex items-center justify-center transition-colors ${selectedMethod === method.id ? 'border-primary bg-primary' : 'border-gray-300 bg-transparent'}`}
            >
              {selectedMethod === method.id && (
                <Check size={20} color={colors.moonWhite} strokeWidth={4} />
              )}
            </View>
          </Pressable>
        ))}
      </View>
      <View style={{ height: 200, backgroundColor: 'transparent', width: '100%' }} />
    </View>
  );
}
