import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { usePremium } from '@/hooks/usePremium';
import { PremiumModal } from './PremiumModal';
import MyIcon from '@/components/ui/Icon';

interface PremiumGateProps {
    children: ReactNode;
    fallback?: ReactNode;
    showUpgradePrompt?: boolean;
    onUpgradePress?: () => void;
}

/**
 * Component that conditionally renders premium features or upgrade prompts
 */
export function PremiumGate({
    children,
    fallback,
    showUpgradePrompt = true,
    onUpgradePress,
}: PremiumGateProps) {
    const { isPremium, isLoading } = usePremium();
    const [showModal, setShowModal] = React.useState(false);

    if (isLoading) {
        return null; // Or a loading indicator
    }

    if (isPremium) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    if (!showUpgradePrompt) {
        return null;
    }

    const handleUpgrade = () => {
        if (onUpgradePress) {
            onUpgradePress();
        } else {
            setShowModal(true);
        }
    };

    return (
        <>
            <TouchableOpacity
                onPress={handleUpgrade}
                className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex-row items-center justify-between"
                activeOpacity={0.7}
            >
                <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                        <MyIcon name="Sparkles" className="text-primary" size={20} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-bold text-text-primary">
                            Función Premium
                        </Text>
                        <Text className="text-sm text-text-secondary">
                            Actualiza para desbloquear esta función
                        </Text>
                    </View>
                </View>
                <MyIcon name="ChevronRight" className="text-primary" />
            </TouchableOpacity>
            <PremiumModal visible={showModal} onClose={() => setShowModal(false)} />
        </>
    );
}

