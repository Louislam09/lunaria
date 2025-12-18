import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/OnboardingContext';
import { STEPS, ALL_STEPS } from '@/constants/onboarding';
import { colors } from '@/utils/colors';

export default function WizardFooter() {
  const insets = useSafeAreaInsets();
  const { actualStep, actualSubStep, setActualStep, setActualSubStep, data } = useOnboarding();

  const step = STEPS[actualStep];
  const currentSubStep = step.subSteps[actualSubStep];
  const { wizard, key: stepKey } = currentSubStep;

  // Calculate progress
  const totalSteps = ALL_STEPS.length;
  const currentStepNumber = STEPS.slice(0, actualStep).reduce((acc, s) => acc + s.subSteps.length, 0) + actualSubStep + 1;
  const progress = (currentStepNumber / totalSteps) * 100;

  const isFirstStep = currentStepNumber === 1;
  const isLastStep = currentStepNumber === totalSteps;

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
    (data.name?.trim().length > 0 && data.lastPeriodStart != null);

  const buttonText = isLastStep ? 'Finalizar' : wizard.button;

  return (
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
      {/* Progress Bar */}
      <View style={{ marginBottom: 16, paddingHorizontal: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textMuted }}>
            {step.title}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textMuted }}>
            {Math.round(progress)}%
          </Text>
        </View>
        <View style={{ height: 4, width: '100%', borderRadius: 9999, backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
          <View style={{ height: '100%', backgroundColor: colors.lavender, borderRadius: 9999, width: `${progress}%` }} />
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {wizard.skippable && !isFirstStep && (
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
        )}

        <Pressable
          onPress={handleBack}
          style={{
            flex: isFirstStep ? 0 : 1,
            height: 56,
            backgroundColor: 'transparent',
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: isFirstStep ? 56 : undefined,
            opacity: isFirstStep ? 0.5 : 1,
          }}
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
          <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700' }}>
            {buttonText}
          </Text>
          {!isLastStep && <ArrowRight size={20} color="#ffffff" />}
        </Pressable>
      </View>
    </View>
  );
}

