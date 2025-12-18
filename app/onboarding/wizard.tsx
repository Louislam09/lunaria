import { useEffect } from 'react';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useOnboarding } from '@/context/OnboardingContext';

export default function OnboardingWizardScreen() {
  const { actualStep, actualSubStep, setActualStep, setActualSubStep, isComplete } = useOnboarding();

  // Initialize step position if not set
  useEffect(() => {
    if (actualStep === 0 && actualSubStep === 0 && !isComplete) {
      setActualStep(0);
      setActualSubStep(0);
    }
  }, []);

  return <OnboardingWizard />;
}

