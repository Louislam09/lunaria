import { ALL_STEPS, STEPS } from '@/constants/onboarding';
import { useOnboarding } from '@/context/OnboardingContext';
import { colors } from '@/utils/colors';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function WizardFooter() {
  const { actualStep, actualSubStep, setActualStep, setActualSubStep, data, completeOnboarding } = useOnboarding();

  const step = STEPS[actualStep];
  const currentSubStep = step.subSteps[actualSubStep];
  const { wizard, key: stepKey } = currentSubStep;

  const isFirstStep = actualStep === 0;
  const isLastStep = actualStep === STEPS.length - 1 && actualSubStep === step.subSteps.length - 1;

  const handleNext = async () => {
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
      // Last step - mark onboarding as complete before navigating
      await completeOnboarding();
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
    (data.name?.trim().length > 0 && data.lastPeriodStart != null)

  const buttonText = isLastStep ? 'Finalizar' : wizard.button;

  return (
    <View className='absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm p-4' >
      <View className='flex-row gap-3' >
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

