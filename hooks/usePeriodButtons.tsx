import React, { useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, Text } from 'react-native';
import MyIcon from '@/components/ui/Icon';
import { OnboardingData } from '@/context/OnboardingContext';

interface DailyLog {
    date: string;
    flow: string | null;
}

interface ActualPeriod {
    startDate: string;
    endDate: string;
}

interface UsePeriodButtonsProps {
    data: Partial<OnboardingData>;
    actualPeriod: ActualPeriod | null;
    dailyLogs: DailyLog[];
    isMarkingEnd: boolean;
    onMarkPeriodEnd: () => Promise<void>;
}

interface PeriodButtons {
    showMarkEnd: boolean;
    showStart: boolean;
    markEndButton: React.ReactElement | null;
    startButton: React.ReactElement | null;
    registerButton: React.ReactElement;
}

const isValidFlow = (flow: string | null | undefined): boolean => {
    if (!flow) return false;
    const flowLower = flow.toLowerCase();
    return flowLower === 'leve' || flowLower === 'medio' || flowLower === 'alto' || flowLower === 'mancha' || flowLower === 'abundante';
};

export function usePeriodButtons({
    data,
    actualPeriod,
    dailyLogs,
    isMarkingEnd,
    onMarkPeriodEnd,
}: UsePeriodButtonsProps): PeriodButtons {
    const buttonState = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!data.lastPeriodStart) {
            return {
                showMarkEnd: false,
                showStart: false,
            };
        }

        const predictedStart = new Date(data.lastPeriodStart);
        predictedStart.setHours(0, 0, 0, 0);
        const predictedEnd = new Date(predictedStart);
        predictedEnd.setDate(predictedEnd.getDate() + (data.periodLength || 5) - 1);
        const isInPredictedRange = today >= predictedStart && today <= predictedEnd;

        let isInActualRange = false;
        if (actualPeriod) {
            const actualStart = new Date(actualPeriod.startDate);
            actualStart.setHours(0, 0, 0, 0);
            const actualEnd = new Date(actualPeriod.endDate);
            actualEnd.setHours(0, 0, 0, 0);
            isInActualRange = today >= actualStart && today <= actualEnd;
        }

        const periodHasEnded = !!data.lastPeriodEnd;

        const hasFlowToday = dailyLogs.some(log => {
            const logDate = new Date(log.date);
            logDate.setHours(0, 0, 0, 0);
            return logDate.getTime() === today.getTime() && isValidFlow(log.flow);
        });

        const shouldShowMarkEnd = (isInPredictedRange || isInActualRange) && !periodHasEnded;

        const threeDaysBeforeStart = new Date(predictedStart);
        threeDaysBeforeStart.setDate(threeDaysBeforeStart.getDate() - 3);
        threeDaysBeforeStart.setHours(0, 0, 0, 0);
        const isWithinThreeDaysBeforeStart = today >= threeDaysBeforeStart && today < predictedStart;
        const predictedStartHasArrived = today >= predictedStart;

        const shouldShowStartButton = (isWithinThreeDaysBeforeStart || predictedStartHasArrived) &&
            !isInPredictedRange &&
            !isInActualRange &&
            !hasFlowToday &&
            !periodHasEnded &&
            !shouldShowMarkEnd;

        return {
            showMarkEnd: shouldShowMarkEnd,
            showStart: shouldShowStartButton,
        };
    }, [data.lastPeriodStart, data.periodLength, data.lastPeriodEnd, actualPeriod, dailyLogs]);

    const markEndButton = useMemo(() => {
        if (!buttonState.showMarkEnd) return null;

        return (
            <Pressable
                onPress={onMarkPeriodEnd}
                disabled={isMarkingEnd}
                className={`py-4 rounded-2xl ${isMarkingEnd ? 'bg-gray-400' : 'bg-rose-600'} items-center justify-center flex-row shadow-lg active:opacity-90`}
            >
                {isMarkingEnd ? (
                    <>
                        <MyIcon name="Loader" size={20} className="text-white" />
                        <Text className="ml-2 text-white font-bold text-lg">
                            Marcando...
                        </Text>
                    </>
                ) : (
                    <>
                        <MyIcon name="Check" size={20} className="text-white" />
                        <Text className="ml-2 text-white font-bold text-lg">
                            Marcar Fin del Periodo
                        </Text>
                    </>
                )}
            </Pressable>
        );
    }, [buttonState.showMarkEnd, isMarkingEnd, onMarkPeriodEnd]);

    const startButton = useMemo(() => {
        if (!buttonState.showStart) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (
            <Pressable
                onPress={() => router.push(`/register?date=${today.toISOString().split('T')[0]}`)}
                className="py-4 rounded-2xl bg-primary items-center justify-center flex-row shadow-lg active:opacity-90"
            >
                <MyIcon name="Droplet" size={20} className="text-white" />
                <Text className="ml-2 text-white font-bold text-lg">
                    Iniciar Periodo
                </Text>
            </Pressable>
        );
    }, [buttonState.showStart]);

    const registerButton = useMemo(() => (
        <Pressable
            onPress={() => router.push('/register')}
            className="py-4 rounded-2xl bg-primary items-center justify-center flex-row shadow-lg active:opacity-90"
        >
            <MyIcon name="Droplet" size={20} className="text-white" />
            <Text className="ml-2 text-white font-bold text-lg">
                Registrar Síntomas
            </Text>
        </Pressable>
    ), []);

    return {
        showMarkEnd: buttonState.showMarkEnd,
        showStart: buttonState.showStart,
        markEndButton,
        startButton,
        registerButton,
    };
}
