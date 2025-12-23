import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import MyIcon from '@/components/ui/Icon';

export default function NotFoundScreen() {
    const handleGoHome = () => {
        router.push({
            pathname: '/'
        });
    };

    const handleReportProblem = () => {
        // TODO: Implement report problem functionality
        console.log('Report problem');
    };

    return (
        <View className="flex-1 bg-background">
            {/* Top App Bar */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                <Pressable
                    onPress={() => router.back()}
                    className="flex w-10 h-10 items-center justify-center rounded-full active:bg-black/5"
                >
                    <MyIcon name="ChevronLeft" className="text-text-primary" size={24} />
                </Pressable>
            </View>

            {/* Main Content (EmptyState) */}
            <View className="flex-1 flex-col items-center justify-center px-6 py-6 pb-20">
                <View className="flex flex-col items-center gap-8 w-full max-w-md">
                    {/* Illustration */}
                    <View className="relative flex items-center justify-center">
                        {/* Background blobs for modern feel */}
                        <View className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full" style={{ opacity: 0.3 }} />
                        <View className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500/10 rounded-full" style={{ opacity: 0.3 }} />

                        <View className="relative rounded-3xl w-64 h-64 overflow-hidden shadow-sm">
                            <Image
                                source={require('@/assets/images/not-found.webp')}
                                contentFit="cover"
                                style={{ width: '100%', height: '100%' }}
                            />
                        </View>
                    </View>

                    {/* Text Content */}
                    <View className="flex flex-col items-center gap-3 text-center">
                        <Text className="text-text-primary text-3xl font-bold leading-tight tracking-tight text-center">
                            ¡Ups! Algo falta aquí
                        </Text>
                        <Text className="text-text-muted text-base font-normal leading-relaxed max-w-[320px] text-center">
                            Parece que te has perdido en el ciclo. Es posible que la página haya sido eliminada o que la dirección sea incorrecta.
                        </Text>
                    </View>

                    {/* Primary Action */}
                    <Pressable
                        onPress={handleGoHome}
                        className="flex w-full max-w-[320px] items-center justify-center overflow-hidden rounded-full h-14 px-6 bg-primary active:opacity-80"
                    >
                        <Text className="truncate text-white text-base font-bold tracking-wide">
                            Volver al Inicio
                        </Text>
                    </Pressable>
                </View>
            </View>

            {/* Footer / Secondary Action */}
            <View className="flex px-4 py-6 justify-center mt-auto">
                <Pressable
                    onPress={handleReportProblem}
                    className="flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-transparent active:opacity-70 flex-row gap-2"
                >
                    <MyIcon name="Info" className="text-text-muted" size={18} />
                    <Text className="truncate text-text-muted text-sm font-semibold leading-normal tracking-[0.015em]">
                        Reportar un problema
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
