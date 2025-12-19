import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/OnboardingContext';
import { STEPS, ALL_STEPS } from '@/constants/onboarding';
import { colors } from '@/utils/colors';

export default function WizardFooter() {
  const { actualStep, actualSubStep, setActualStep, setActualSubStep, data } = useOnboarding();

  const step = STEPS[actualStep];
  const currentSubStep = step.subSteps[actualSubStep];
  const { wizard, key: stepKey } = currentSubStep;

  // Calculate progress
  const totalSteps = ALL_STEPS.length - 1;

  const isFirstStep = actualStep === 0;
  const isLastStep = actualStep === totalSteps;

  const handleNext = () => {
    if (wizard.skipTo) {
      const targetStepIndex = STEPS.findIndex(s => s.title === wizard.skipTo);
      if (targetStepIndex > -1) {
        setActualStep(targetStepIndex);
        setActualSubStep(0);
        return;
      }
    }

    if (actualSubStep < step.subSteps.length - 1) {
      setActualSubStep(actualSubStep + 1);
    } else if (actualStep < STEPS.length - 1) {
      setActualStep(actualStep + 1);
      setActualSubStep(0);
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (isFirstStep) {
      router.back();
      return;
    }

    if (actualSubStep > 0) {
      setActualSubStep(actualSubStep - 1);
    } else if (actualStep > 0) {
      setActualStep(actualStep - 1);
      setActualSubStep(STEPS[actualStep - 1].subSteps.length - 1);
    }
  };

  const handleSkip = () => handleNext();

  // Validation for info step
  const canContinue = stepKey !== 'info' ||
    (data.name?.trim().length > 0 && data.lastPeriodStart != null) || true

  const buttonText = isLastStep ? 'Finalizar' : wizard.button;

  return (
    <View className='absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-4' >
      {/* Navigation Buttons */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* {wizard.skippable && !isFirstStep && (
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
        )} */}

        <Pressable
          className={`h-full w-14 rounded-full  items-center justify-center bg-transparent ${isFirstStep ? 'hidden' : ''}`}
          onPress={handleBack}
          disabled={isFirstStep}
        >
          <ArrowLeft size={20} color={isFirstStep ? colors.textMuted : colors.textPrimary} />
        </Pressable>

        <Pressable
          onPress={handleNext}
          disabled={!canContinue}
          style={{
            flex: 1,
            height: 56,
            backgroundColor: canContinue ? colors.lavender : '#cbd5e1',
            borderRadius: 9999,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: canContinue ? 1 : 0.6,
          }}
        >
          <Text className='text-white text-lg font-bold'>{buttonText}</Text>
          {!isLastStep && <ArrowRight size={20} color="#ffffff" />}
        </Pressable>
      </View>
    </View >
  );
}

