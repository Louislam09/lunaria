import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useOnboarding } from '@/context/OnboardingContext';
import { STEPS } from '@/constants/onboarding';
import { colors } from '@/utils/colors';

export default function WizardFooter() {
  const insets = useSafeAreaInsets();
  const { actualStep, actualSubStep, setActualStep, setActualSubStep, data } = useOnboarding();

  const step = STEPS[actualStep];
  const currentStep = step.subSteps[actualSubStep]

  const { wizard, key: stepKey } = currentStep;

  // Calculate total steps for progress
  const totalSteps = STEPS.reduce((acc, s) => acc + (s.subSteps?.length || 1), 0);
  const currentStepNumber = STEPS.slice(0, actualStep).reduce((acc, s) => acc + (s.subSteps?.length || 1), 0) + actualSubStep + 1;
  const progress = (currentStepNumber / totalSteps) * 100;


  const buttonText = wizard.button;

  // Find next valid step
  const findNextValidStep = (startStepIndex: number, startSubStepIndex: number) => {
    let currentStepIndex = startStepIndex;
    let currentSubStepIndex = startSubStepIndex;

    while (true) {
      const currentStep = STEPS[currentStepIndex];
      const hasSubSteps = currentStep?.subSteps?.length > 0;

      if (hasSubSteps) {
        if (currentSubStepIndex < currentStep.subSteps.length - 1) {
          currentSubStepIndex++;
        } else {
          currentStepIndex++;
          currentSubStepIndex = 0;
        }
      } else {
        currentStepIndex++;
        currentSubStepIndex = 0;
      }

      if (currentStepIndex >= STEPS.length) {
        // Reached the end - finish onboarding
        return null;
      }

      // Check if step should be skipped
      const stepToCheck = STEPS[currentStepIndex];
      const subStepToCheck = stepToCheck?.subSteps?.[currentSubStepIndex];
      const step = subStepToCheck || stepToCheck;

      if (!wizard.skipTo) {
        return { stepIndex: currentStepIndex, subStepIndex: currentSubStepIndex };
      }
    }
  };

  // Find previous valid step
  const findPreviousValidStep = (startStepIndex: number, startSubStepIndex: number) => {
    let currentStepIndex = startStepIndex;
    let currentSubStepIndex = startSubStepIndex;

    while (true) {
      const currentStep = STEPS[currentStepIndex];
      const hasSubSteps = currentStep?.subSteps?.length > 0;

      if (hasSubSteps) {
        if (currentSubStepIndex > 0) {
          currentSubStepIndex--;
        } else {
          currentStepIndex--;
          if (currentStepIndex < 0) break;
          const previousStep = STEPS[currentStepIndex];
          currentSubStepIndex = previousStep?.subSteps?.length - 1 || 0;
        }
      } else {
        currentStepIndex--;
        currentSubStepIndex = 0;
      }

      if (currentStepIndex < 0) break;

      // Check if step should be skipped
      const stepToCheck = STEPS[currentStepIndex];
      const subStepToCheck = stepToCheck?.subSteps?.[currentSubStepIndex];
      const step = subStepToCheck || stepToCheck;

      if (!wizard.skipTo) {
        return { stepIndex: currentStepIndex, subStepIndex: currentSubStepIndex };
      }
    }

    return null;
  };

  const handleNext = () => {
    // Check if we should skip to a specific step
    if (wizard.skipTo && wizard.skippable) {
      const targetStepIndex = STEPS.findIndex(s => s.title === wizard.skipTo);
      if (targetStepIndex > -1) {
        const targetStep = STEPS[targetStepIndex];
        setActualStep(targetStepIndex);
        setActualSubStep(0);
        return;
      }
    }

    const next = findNextValidStep(actualStep, actualSubStep);
    if (next) {
      setActualStep(next.stepIndex);
      setActualSubStep(next.subStepIndex);
    } else {
      // Finished onboarding - navigate to tabs
      router.replace('/(tabs)');
    }
  };

  const handleBack = () => {
    if (actualStep === 0 && actualSubStep === 0) {
      router.back();
      return;
    }

    const prev = findPreviousValidStep(actualStep, actualSubStep);
    if (prev) {
      setActualStep(prev.stepIndex);
      setActualSubStep(prev.subStepIndex);
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    if (wizard.skipTo && wizard.skippable) {
      handleNext(); // Use the skip logic
    } else {
      handleNext();
    }
  };

  const isFirstStep = actualStep === 0 && actualSubStep === 0;
  const isLastStep = actualStep === STEPS.length - 1;

  // Validation for info step
  const canContinue = stepKey !== 'info' ||
    (data.name && data.name.trim().length > 0 && data.lastPeriodStart !== null && data.lastPeriodStart !== undefined);

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
        {wizard.skippable && !isFirstStep ? (
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
        ) : null}

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
            {isLastStep ? 'Finalizar' : buttonText}
          </Text>
          {!isLastStep && <ArrowRight size={20} color="#ffffff" />}
        </Pressable>
      </View>
    </View>
  );
}

