import React from 'react';
import { View } from 'react-native';
import { useOnboarding } from '@/context/OnboardingContext';
import { STEPS } from '@/constants/onboarding';
import WizardFooter from './WizardFooter';

export default function OnboardingWizard() {
  const { actualStep, actualSubStep } = useOnboarding();
  console.log({ actualStep, actualSubStep });

  const step = STEPS[actualStep];
  const currentStep = step.subSteps[actualSubStep]
  const { component: Component } = currentStep

  return (
    <View style={{ flex: 1 }}>
      <Component />
      <WizardFooter />
    </View>
  );
}

