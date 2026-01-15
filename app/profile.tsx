import { SettingsItem } from "@/components/settings/SettingsItem"
import { SettingsSection } from "@/components/settings/SettingsSection"
import MyIcon from "@/components/ui/Icon"
import { useAuth } from "@/context/AuthContext"
import { useAlert } from "@/context/AlertContext"
import { useOnboarding } from "@/context/OnboardingContext"
import { useDailyLogs, useCycles } from "@/hooks/useReactiveData"
import { formatDate } from "@/utils/dates"
import { getAvatarSource } from "@/utils/avatar"
import { getAllPeriods } from "@/utils/periodHistory"
import Constants from 'expo-constants'
import { differenceInYears } from 'date-fns'
import { router, Stack } from "expo-router"
import { useEffect, useState, useMemo } from "react"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { MyImage } from "@/components/ui"
import * as ImagePicker from 'expo-image-picker'

interface CycleHistory {
    start_date: string
    end_date: string
    month: string
    duration: number
    delay?: number
}

export default function ProfileScreen() {
    const version = Constants.expoConfig?.version || '1.0.0'
    const { data, reset, updateData } = useOnboarding()
    const { user, logout, isAuthenticated, localUserId } = useAuth()
    const { alertError, alertSuccess, alertWarning, confirm, actionSheet } = useAlert()
    const [plan, setPlan] = useState<'premium' | 'free'>('free')
    const [isPickingImage, setIsPickingImage] = useState(false)
    const userName = data.name || user?.name || 'Usuario'
    const userEmail = user?.email || ' '
    const { averageCycleLength = 28, periodLength = 5 } = data

    const userId = isAuthenticated && user ? user.id : localUserId

    // Use reactive hooks - automatically updates when data changes
    const logs = useDailyLogs(userId || '')
    const cycles = useCycles(userId || '')

    // Calculate age from birthdate
    const age = data.birthDate ? differenceInYears(new Date(), new Date(data.birthDate)) : null
    const birthDateFormatted = data.birthDate ? formatDate(data.birthDate, 'birthday') : '-'

    // Calculate cycle history reactively
    const cycleHistory = useMemo(() => {
        if (!userId) return []

        const lastPeriodStart = data.lastPeriodStart ? new Date(data.lastPeriodStart) : undefined
        const allPeriods = getAllPeriods(logs, cycles, averageCycleLength, lastPeriodStart)

        if (allPeriods.length === 0) {
            return []
        }

        // Get last 2 periods for profile display
        const recentPeriods = allPeriods.slice(0, 2) // Already sorted newest first

        // Convert to CycleHistory format for compatibility
        return recentPeriods.map(period => ({
            start_date: period.startDate,
            end_date: period.endDate,
            month: period.month,
            duration: period.cycleLength || averageCycleLength,
            delay: period.delay
        }))
    }, [logs, cycles, data.lastPeriodStart, averageCycleLength, userId])

    const handleLogout = async () => {
        confirm(
            'Cerrar Sesión',
            '¿Estás seguro que deseas cerrar sesión?',
            async () => {
                try {
                    await logout()
                    router.replace('/splash')
                } catch (error) {
                    console.error('Logout error:', error)
                    alertError('Error', 'No se pudo cerrar sesión')
                }
            }
        )
    }

    const handleDeleteData = async () => {
        confirm(
            'Borrar todos los datos',
            '¿Estás seguro? Esta acción no se puede deshacer.',
            async () => {
                try {
                    await reset()
                    router.replace('/splash')
                } catch (error) {
                    console.error('Delete error:', error)
                    alertError('Error', 'No se pudieron borrar los datos')
                }
            }
        )
    }

    const formatCycleDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return formatDate(date, 'short')
    }

    const handlePickImage = async () => {
        if (isPickingImage) return;

        try {
            setIsPickingImage(true);

            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alertWarning('Permisos requeridos', 'Necesitamos acceso a tu galería para seleccionar una foto de perfil.');
                return;
            }

            // Show action sheet to choose between camera and gallery
            actionSheet(
                'Seleccionar foto de perfil',
                '¿De dónde deseas seleccionar la foto?',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                        onPress: () => { },
                    },
                    {
                        text: 'Galería',
                        onPress: async () => {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: 'images',
                                allowsEditing: true,
                                aspect: [1, 1],
                                quality: 1,
                            });

                            if (!result.canceled && result.assets[0]) {
                                await saveAvatarImage(result.assets[0].uri);
                            }
                        },
                    },
                    {
                        text: 'Cámara',
                        onPress: async () => {
                            // Request camera permissions
                            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                            if (cameraPermission.status !== 'granted') {
                                alertWarning('Permisos requeridos', 'Necesitamos acceso a tu cámara para tomar una foto.');
                                return;
                            }

                            const result = await ImagePicker.launchCameraAsync({
                                allowsEditing: true,
                                aspect: [1, 1],
                                quality: 1,
                            });

                            if (!result.canceled && result.assets[0]) {
                                await saveAvatarImage(result.assets[0].uri);
                            }
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Error picking image:', error);
            alertError('Error', 'No se pudo seleccionar la imagen. Intenta más tarde.');
        } finally {
            setIsPickingImage(false);
        }
    };

    const saveAvatarImage = async (imageUri: string) => {
        try {
            // Update avatar URL in onboarding data
            await updateData({ avatarUrl: imageUri });
        } catch (error) {
            console.error('Error saving avatar:', error);
            alertError('Error', 'No se pudo guardar la imagen. Intenta más tarde.');
        }
    };

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen
                options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    presentation: 'pageSheet'
                }}
            />

            {/* Header */}
            <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
                <Text className="text-2xl font-bold text-text-primary">
                    Perfil
                </Text>

                <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-background">
                    <MyIcon name="Bell" className="text-text-primary" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                className="px-4"
                showsVerticalScrollIndicator={false}
            >
                <View className="h-20" />

                {/* Profile Card */}
                <View className="mt-4 px-4">
                    <View className="relative overflow-hidden rounded-[40px] bg-white p-6 border border-gray-100 shadow-md">
                        {/* Decorative blurred circle */}
                        <View className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/40 blur-2xl" />

                        <View className="items-center text-center">
                            {/* Avatar */}
                            <View className="relative mb-4">
                                <View className="h-28 w-28 rounded-full bg-gray-200 items-center justify-center border-4 border-white">
                                    <MyImage
                                        source={getAvatarSource(data.avatarUrl)}
                                        contentFit="contain"
                                        className="h-28 w-28 rounded-full"
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={handlePickImage}
                                    activeOpacity={0.8}
                                    className="absolute bottom-1 right-1 h-8 w-8 items-center justify-center rounded-full bg-primary border-2 border-white"
                                >
                                    <MyIcon name="Pencil" size={16} className="text-white" />
                                </TouchableOpacity>
                            </View>

                            {/* Name */}
                            <Text className="text-2xl font-bold text-text-primary">
                                {userName}
                            </Text>

                            {/* Email */}
                            <Text className="mt-1 text-base font-medium text-text-muted">
                                {userEmail}
                            </Text>

                            {/* Age and Birthdate */}
                            <View className="flex-row gap-3 mt-4">
                                <View className="flex-1  items-center justify-center bg-white rounded-xl p-3 ">
                                    <Text className="text-base font-bold uppercase text-text-muted mb-1">
                                        edad
                                    </Text>
                                    <Text className="text-xl font-bold text-text-primary text-center">
                                        {age || '-'}
                                    </Text>
                                </View>
                                <View className="flex-1  items-center justify-center bg-white rounded-xl p-3 ">
                                    <Text className="text-base font-bold uppercase text-text-muted mb-1">
                                        nacimiento
                                    </Text>
                                    <Text className="text-xl font-bold text-text-primary text-center">
                                        {birthDateFormatted}
                                    </Text>
                                </View>
                            </View>

                            {/* Premium Badge */}
                            {plan === 'premium' ? (
                                <View className="mt-4 rounded-full bg-primary/10 px-4 py-1.5">
                                    <Text className="text-xs font-bold uppercase tracking-wide text-primary">
                                        USUARIO PREMIUM
                                    </Text>
                                </View>
                            ) : (
                                <View className="mt-4 rounded-full bg-primary/10 px-4 py-1.5">
                                    <Text className="text-xs font-bold uppercase tracking-wide text-primary">
                                        USUARIO FREE
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Mi Ciclo */}
                <SettingsSection title="Mi Ciclo">
                    <SettingsItem
                        icon="Droplet"
                        iconBg="bg-purple-100"
                        iconColor="text-purple-500"
                        title="Duración del periodo"
                        subtitle={`${periodLength} día${periodLength > 1 ? 's' : ''}`}
                    />
                    <SettingsItem
                        icon="RefreshCw"
                        iconBg="bg-purple-100"
                        iconColor="text-purple-500"
                        title="Duración del ciclo"
                        subtitle={`${averageCycleLength} día${averageCycleLength > 1 ? 's' : ''}`}
                        showDivider={false}
                    />
                </SettingsSection>

                {/* Historial de Ciclos */}
                <SettingsSection title="Historial de Ciclos">
                    {cycleHistory.length > 0 ? (
                        <>
                            {cycleHistory.map((cycle, index) => {
                                const startFormatted = formatCycleDate(cycle.start_date)
                                const endFormatted = formatCycleDate(cycle.end_date)

                                // Build subtitle with delay info if present
                                let subtitle = `${startFormatted} - ${endFormatted} • ${cycle.duration} día${cycle.duration > 1 ? 's' : ''}`
                                if (cycle.delay && cycle.delay > 0) {
                                    subtitle += ` • Retraso: ${cycle.delay} día${cycle.delay > 1 ? 's' : ''}`
                                }

                                return (
                                    <SettingsItem
                                        key={`${cycle.start_date}-${index}`}
                                        icon={index === 0 ? "Clock" : "Check"}
                                        iconBg={index === 0 ? "bg-pink-100" : cycle.delay && cycle.delay > 0 ? "bg-orange-100" : "bg-purple-100"}
                                        iconColor={index === 0 ? "text-pink-500" : cycle.delay && cycle.delay > 0 ? "text-orange-500" : "text-purple-500"}
                                        title={cycle.month}
                                        subtitle={subtitle}
                                        showDivider={index < cycleHistory.length - 1}
                                    />
                                )
                            })}
                            <TouchableOpacity
                                onPress={() => router.push('/period-history')}
                                className="px-5 py-3 pb-4"
                            >
                                <Text className="text-sm font-medium text-blue-500 text-center ">
                                    VER HISTORIAL COMPLETO
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View className="px-5 py-3">
                            <Text className="text-sm text-text-muted">
                                No hay historial de ciclos aún
                            </Text>
                        </View>
                    )}
                </SettingsSection>

                {/* Account Actions */}
                <View className="mt-6 gap-4">
                    {isAuthenticated && (
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="w-full py-4"
                        >
                            <Text className="text-center text-base font-medium text-pink-500">
                                Cerrar Sesión
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Version */}
                <View className="mt-6 items-center">
                    <Text className="text-xs text-text-muted">
                        Versión {version}
                    </Text>
                </View>
            </ScrollView>
        </View>
    )
}

