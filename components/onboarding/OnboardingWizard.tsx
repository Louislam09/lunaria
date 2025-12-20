import WizardFooter from '@/components/onboarding/WizardFooter';
import WizardHeader from '@/components/onboarding/WizardHeader';
import { STEPS } from '@/constants/onboarding';
import { useOnboarding } from '@/context/OnboardingContext';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function OnboardingWizard() {
  const { actualStep, actualSubStep } = useOnboarding();

  const step = STEPS[actualStep];
  const currentStep = step.subSteps[actualSubStep]
  const { component: Component } = currentStep

  const classname = `flex-1 pt-10 relative bg-background`

  return (
    <View className={classname}>
      <WizardHeader />
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 128, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
        <View className="h-20 " />
        <Component />
      </ScrollView>
      <WizardFooter />
    </View>
  );
}

