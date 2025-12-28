import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import MyIcon from './Icon';
import type { icons } from 'lucide-react-native';
import { colors } from '@/utils/colors';

export type AlertType = 'info' | 'error' | 'success' | 'warning';

export type AlertButton = {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
};

export type AlertOptions = {
    title: string;
    message?: string;
    type?: AlertType;
    buttons?: AlertButton[];
    cancelable?: boolean;
    onDismiss?: () => void;
};

interface AlertModalProps {
    visible: boolean;
    title: string;
    message?: string;
    type?: AlertType;
    buttons?: AlertButton[];
    cancelable?: boolean;
    onDismiss?: () => void;
}

const getTypeStyles = (type: AlertType) => {
    switch (type) {
        case 'error':
            return {
                icon: 'CircleAlert' as keyof typeof icons,
                iconColor: 'text-red-500',
                iconBg: 'bg-red-100',
                titleColor: 'text-red-600',
            };
        case 'success':
            return {
                icon: 'CircleCheck' as keyof typeof icons,
                iconColor: 'text-green-500',
                iconBg: 'bg-green-100',
                titleColor: 'text-green-600',
            };
        case 'warning':
            return {
                icon: 'TriangleAlert' as keyof typeof icons,
                iconColor: 'text-yellow-500',
                iconBg: 'bg-yellow-100',
                titleColor: 'text-yellow-600',
            };
        default: // info
            return {
                icon: 'Info' as keyof typeof icons,
                iconColor: 'text-blue-500',
                iconBg: 'bg-blue-100',
                titleColor: 'text-blue-600',
            };
    }
};

export function AlertModal({
    visible,
    title,
    message,
    type = 'info',
    buttons = [{ text: 'OK' }],
    cancelable = true,
    onDismiss,
}: AlertModalProps) {
    const styles = getTypeStyles(type);

    const handleButtonPress = (button: AlertButton) => {
        if (button.onPress) {
            button.onPress();
        }
        if (onDismiss) {
            onDismiss();
        }
    };

    const handleBackdropPress = () => {
        if (cancelable && onDismiss) {
            onDismiss();
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            onRequestClose={cancelable ? onDismiss : undefined}
            backdropColor={colors.lavender + '39'}

        >
            <Pressable
                onPress={handleBackdropPress}
                className="flex-1 items-center justify-center bg-black/50 px-4"
            >
                <Pressable
                    onPress={(e) => e.stopPropagation()}
                    className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl"
                >
                    {/* Icon */}
                    <View className="items-center mb-4">
                        <View className={`h-16 w-16 rounded-full ${styles.iconBg} items-center justify-center`}>
                            <MyIcon name={styles.icon} size={32} className={styles.iconColor} />
                        </View>
                    </View>

                    {/* Title */}
                    <Text className={`text-xl font-bold text-center mb-2 ${styles.titleColor}`}>
                        {title}
                    </Text>

                    {/* Message */}
                    {message && (
                        <Text className="text-base text-text-muted text-center mb-6">
                            {message}
                        </Text>
                    )}

                    {/* Buttons */}
                    <View className="gap-3">
                        {buttons.map((button, index) => {
                            const isCancel = button.style === 'cancel';
                            const isDestructive = button.style === 'destructive';

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleButtonPress(button)}
                                    className={`py-3.5 px-4 rounded-2xl ${isCancel
                                        ? 'bg-gray-100'
                                        : isDestructive
                                            ? 'bg-red-500'
                                            : 'bg-primary'
                                        }`}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        className={`text-center font-semibold text-base ${isCancel
                                            ? 'text-text-primary'
                                            : isDestructive
                                                ? 'text-white'
                                                : 'text-white'
                                            }`}
                                    >
                                        {button.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

