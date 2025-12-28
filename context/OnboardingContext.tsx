import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Storage from 'expo-sqlite/kv-store';

export type ContraceptiveMethod =
  | 'none'
  | 'condom'
  | 'pill'
  | 'injection'
  | 'implant'
  | 'iud_hormonal'
  | 'iud_copper'
  | 'other';

export type OnboardingData = {
  name: string;
  birthDate: Date;

  lastPeriodStart: Date;
  cycleType: 'regular' | 'irregular';

  averageCycleLength?: number;
  cycleRangeMin?: number;
  cycleRangeMax?: number;
  periodLength: number;

  symptoms?: string[];
  wantsPregnancy?: boolean;
  contraceptiveMethod?: ContraceptiveMethod;
  avatarUrl?: string;
};

type OnboardingContextType = {
  data: Partial<OnboardingData>;
  updateData: (values: Partial<OnboardingData>) => void;
  reset: () => void;
  completeOnboarding: () => Promise<void>;
  isComplete: boolean;
  isLoading: boolean;
  // Wizard navigation
  actualStep: number;
  actualSubStep: number;
  setActualStep: (step: number) => void;
  setActualSubStep: (subStep: number) => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'onboardingData';
const COMPLETE_KEY = 'onboardingComplete';

const STEP_KEY = 'onboardingStep';
const SUBSTEP_KEY = 'onboardingSubStep';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actualStep, setActualStepState] = useState(0);
  const [actualSubStep, setActualSubStepState] = useState(0);

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedData, completeStatus, savedStep, savedSubStep] = await Promise.all([
        Storage.getItem(STORAGE_KEY),
        Storage.getItem(COMPLETE_KEY),
        Storage.getItem(STEP_KEY),
        Storage.getItem(SUBSTEP_KEY),
      ]);

      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Convert date strings back to Date objects
        if (parsed.birthDate) parsed.birthDate = new Date(parsed.birthDate);
        if (parsed.lastPeriodStart) parsed.lastPeriodStart = new Date(parsed.lastPeriodStart);
        setData(parsed);
      }

      if (completeStatus === 'true') {
        setIsComplete(true);
      }

      // Load step position
      if (savedStep !== null) {
        setActualStepState(parseInt(savedStep, 10));
      }
      if (savedSubStep !== null) {
        setActualSubStepState(parseInt(savedSubStep, 10));
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setActualStep = async (step: number) => {
    setActualStepState(step);
    try {
      await Storage.setItem(STEP_KEY, step.toString());
    } catch (error) {
      console.error('Error saving step:', error);
    }
  };

  const setActualSubStep = async (subStep: number) => {
    setActualSubStepState(subStep);
    try {
      await Storage.setItem(SUBSTEP_KEY, subStep.toString());
    } catch (error) {
      console.error('Error saving substep:', error);
    }
  };

  const updateData = async (values: Partial<OnboardingData>) => {
    const newData = { ...data, ...values };
    setData(newData);

    // Persist to storage
    try {
      const dataToStore = JSON.stringify(newData);
      await Storage.setItem(STORAGE_KEY, dataToStore);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const completeOnboarding = async () => {
    // Verify required fields are present before marking as complete
    const required = [
      data.name,
      data.birthDate,
      data.lastPeriodStart,
      data.cycleType,
      data.periodLength,
    ];

    // For cycle type, need either averageCycleLength OR (cycleRangeMin + cycleRangeMax)
    const cycleComplete =
      data.cycleType === 'regular'
        ? !!data.averageCycleLength
        : !!(data.cycleRangeMin && data.cycleRangeMax);

    const allRequired = required.every(Boolean) && cycleComplete;

    if (allRequired) {
      setIsComplete(true);
      try {
        await Storage.setItem(COMPLETE_KEY, 'true');

        // Request notification permissions
        // Scheduling will be handled automatically by useNotificationManager hook
        // when the app detects cycle data changes
        try {
          const { requestPermissions } = await import('@/services/notifications');
          await requestPermissions();
          console.log('Notification permissions requested during onboarding');
        } catch (notificationError) {
          // Don't fail onboarding if notification setup fails
          console.error('Error requesting notification permissions:', notificationError);
        }
      } catch (error) {
        console.error('Error saving completion status:', error);
      }
    } else {
      console.warn('Cannot complete onboarding: required fields missing');
    }
  };


  const reset = async () => {
    setData({});
    setIsComplete(false);
    setActualStepState(0);
    setActualSubStepState(0);
    try {
      await Storage.removeItem(STORAGE_KEY);
      await Storage.removeItem(COMPLETE_KEY);
      await Storage.removeItem(STEP_KEY);
      await Storage.removeItem(SUBSTEP_KEY);
    } catch (error) {
      console.error('Error resetting onboarding data:', error);
    }
  };

  return (
    <OnboardingContext.Provider value={{
      data,
      updateData,
      reset,
      completeOnboarding,
      isComplete,
      isLoading,
      actualStep,
      actualSubStep,
      setActualStep,
      setActualSubStep,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

