import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// AsyncStorage - using same pattern as AuthContext
let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // Fallback for development
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  };
}

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
};

type OnboardingContextType = {
  data: Partial<OnboardingData>;
  updateData: (values: Partial<OnboardingData>) => void;
  reset: () => void;
  isComplete: boolean;
  isLoading: boolean;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEY = 'onboardingData';
const COMPLETE_KEY = 'onboardingComplete';

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedData, completeStatus] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(COMPLETE_KEY),
      ]);

      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Convert date strings back to Date objects
        if (parsed.birthDate) parsed.birthDate = new Date(parsed.birthDate);
        if (parsed.lastPeriodStart) parsed.lastPeriodStart = new Date(parsed.lastPeriodStart);
        setData(parsed);
        
        // Check completion after loading data
        checkCompletion(parsed);
      }

      if (completeStatus === 'true') {
        setIsComplete(true);
      }
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = async (values: Partial<OnboardingData>) => {
    const newData = { ...data, ...values };
    setData(newData);

    // Persist to storage
    try {
      const dataToStore = JSON.stringify(newData);
      await AsyncStorage.setItem(STORAGE_KEY, dataToStore);
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }

    // Check if onboarding is complete
    checkCompletion(newData);
  };

  const checkCompletion = async (checkData: Partial<OnboardingData>) => {
    const required = [
      checkData.name,
      checkData.birthDate,
      checkData.lastPeriodStart,
      checkData.cycleType,
      checkData.periodLength,
    ];

    // For cycle type, need either averageCycleLength OR (cycleRangeMin + cycleRangeMax)
    const cycleComplete =
      checkData.cycleType === 'regular'
        ? !!checkData.averageCycleLength
        : !!(checkData.cycleRangeMin && checkData.cycleRangeMax);

    const allRequired = required.every(Boolean) && cycleComplete;

    if (allRequired) {
      setIsComplete(true);
      try {
        await AsyncStorage.setItem(COMPLETE_KEY, 'true');
      } catch (error) {
        console.error('Error saving completion status:', error);
      }
    } else {
      setIsComplete(false);
    }
  };

  const reset = async () => {
    setData({});
    setIsComplete(false);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(COMPLETE_KEY);
    } catch (error) {
      console.error('Error resetting onboarding data:', error);
    }
  };

  return (
    <OnboardingContext.Provider value={{ data, updateData, reset, isComplete, isLoading }}>
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

