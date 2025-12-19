import { useOnboarding } from '@/context/OnboardingContext';
import { colors } from '@/utils/colors';
import { Check } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

const symptoms = [
  { id: 'abdominal_pain', label: 'Dolor abdominal', icon: '🫄' },
  { id: 'back_pain', label: 'Dolor de espalda', icon: '🩹' },
  { id: 'nausea', label: 'Náuseas', icon: '🤢' },
  { id: 'mood_changes', label: 'Cambios de humor', icon: '😢' },
  { id: 'sensitivity', label: 'Sensibilidad', icon: '💧' },
  { id: 'fatigue', label: 'Fatiga', icon: '⚡' },
  { id: 'acne', label: 'Acné', icon: '😐' },
  { id: 'cravings', label: 'Antojos', icon: '🍦' },
];

export default function Step2() {
  const { data, updateData } = useOnboarding();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(data.symptoms || []);

  useEffect(() => {
    updateData({ symptoms: selectedSymptoms });
  }, [selectedSymptoms]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View className='mb-8'>
        <Text
          className='text-3xl font-bold tracking-tight text-text-primary mb-2'
        >
          ¿Cuáles son tus síntomas más comunes?
        </Text>
        <Text className='text-base text-text-muted leading-6'  >
          Selecciona todo lo que aplique para mejorar tus predicciones mensuales. Este paso es opcional.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        {symptoms.map((symptom) => {
          const isSelected = selectedSymptoms.includes(symptom.id);
          return (
            <Pressable
              key={symptom.id}
              onPress={() => toggleSymptom(symptom.id)}
              className={`w-[48%] p-4 rounded-2xl bg-white  border-2  ${isSelected ? 'border-primary' : 'border-gray-200'}  items-center justify-center`}
            >
              <View className='flex-row justify-between items-start mb-3 relative'  >
                <View
                  className={`size-12 rounded-full items-center justify-center ${isSelected ? 'bg-primary/80' : 'bg-gray-200'}`}
                >
                  <Text className='text-2xl'>{symptom.icon}</Text>
                </View>
              </View>

              <Text className='text-base font-medium text-text-primary text-center'  >
                {symptom.label}
              </Text>

              <View
                className={`absolute top-3 right-3 size-6 rounded-full border-2 
               flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-gray-300 bg-transparent'}`}
              >
                {isSelected && (
                  <Check size={20} color={colors.moonWhite} strokeWidth={4} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={{ height: 200, backgroundColor: 'transparent', width: '100%' }} />
    </View>
  );
}
