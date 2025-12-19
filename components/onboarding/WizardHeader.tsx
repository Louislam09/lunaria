import { ALL_STEPS, STEPS } from '@/constants/onboarding';
import { useOnboarding } from '@/context/OnboardingContext';
import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/utils/colors';
import OnboardingProgress from '../ui/OnboardingProgress';

export default function WizardHeader() {
    const { actualStep, actualSubStep, setActualStep, setActualSubStep, data } = useOnboarding();

    const step = STEPS[actualStep];
    const currentSubStep = step.subSteps[actualSubStep];
    const { wizard, key: stepKey } = currentSubStep;

    // Calculate progress
    const totalSteps = ALL_STEPS.length;
    const currentStepNumber = STEPS.slice(0, actualStep).reduce((acc, s) => acc + s.subSteps.length, 0) + actualSubStep + 1;
    const progress = (currentStepNumber / totalSteps) * 100;


    return (
        <View className="absolute -top-1 left-0 right-0 z-10 flex justify-between items-start px-6 pt-6 bg-white/90 backdrop-blur-sm">
            <Text className="text-lg font-bold text-text-muted">{step.title}</Text>
            <OnboardingProgress currentStep={currentStepNumber} />
        </View>
    );
}