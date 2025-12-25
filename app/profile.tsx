import { SettingsItem } from "@/components/settings/SettingsItem"
import { SettingsSection } from "@/components/settings/SettingsSection"
import MyIcon from "@/components/ui/Icon"
import { useAuth } from "@/context/AuthContext"
import { useOnboarding } from "@/context/OnboardingContext"
import { DailyLogsService } from "@/services/dataService"
import { formatDate } from "@/utils/dates"
import Constants from 'expo-constants'
import { differenceInYears, differenceInDays } from 'date-fns'
import { router, Stack } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native"

interface CycleHistory {
    start_date: string
    end_date: string
    month: string
    duration: number
}

export default function ProfileScreen() {
    const version = Constants.expoConfig?.version || '1.0.0'
    const { data, reset } = useOnboarding()
    const { user, logout, isAuthenticated, localUserId } = useAuth()
    const [cycleHistory, setCycleHistory] = useState<CycleHistory[]>([])
    const [plan, setPlan] = useState<'premium' | 'free'>('free')
    const userName = data.name || user?.name || 'Usuario'
    const userEmail = user?.email || 'usuario@email.com'
    const { averageCycleLength = 28, periodLength = 5 } = data

    const userId = isAuthenticated && user ? user.id : localUserId

    // Calculate age from birthdate
    const age = data.birthDate ? differenceInYears(new Date(), new Date(data.birthDate)) : null
    const birthDateFormatted = data.birthDate ? formatDate(data.birthDate, 'birthday') : '-'
    // Load cycle history
    useEffect(() => {
        if (userId) {
            loadCycleHistory()
        }
    }, [userId])

    const loadCycleHistory = async () => {
        if (!userId) return

        try {
            // Get all logs and calculate cycles from period days
            const logs = await DailyLogsService.getAll(userId)

            // Filter logs with flow (period days) and sort by date
            const periodLogs = logs
                .filter(log => {
                    const flow = log.flow?.toLowerCase()
                    return flow && (flow === 'leve' || flow === 'ligero' || flow === 'medio' || flow === 'alto' || flow === 'abundante')
                })
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

            if (periodLogs.length === 0) {
                setCycleHistory([])
                return
            }

            // Find period starts (first day of each period - gaps > 2 days indicate new period)
            const periodStarts: Array<{ date: string; endDate: string }> = []
            let currentPeriodStart: string | null = null
            let currentPeriodEnd: string | null = null

            for (let i = 0; i < periodLogs.length; i++) {
                const logDate = periodLogs[i].date

                if (!currentPeriodStart) {
                    currentPeriodStart = logDate
                    currentPeriodEnd = logDate
                } else {
                    const prevDate = periodLogs[i - 1].date
                    const daysDiff = differenceInDays(new Date(logDate), new Date(prevDate))

                    if (daysDiff > 2) {
                        // Save previous period
                        if (currentPeriodStart && currentPeriodEnd) {
                            periodStarts.push({
                                date: currentPeriodStart,
                                endDate: currentPeriodEnd
                            })
                        }
                        // Start new period
                        currentPeriodStart = logDate
                        currentPeriodEnd = logDate
                    } else {
                        currentPeriodEnd = logDate
                    }
                }
            }

            // Add last period
            if (currentPeriodStart && currentPeriodEnd) {
                periodStarts.push({
                    date: currentPeriodStart,
                    endDate: currentPeriodEnd
                })
            }

            if (periodStarts.length < 2) {
                setCycleHistory([])
                return
            }

            // Create cycle history from last 2 periods
            const cycles: CycleHistory[] = []
            const recentPeriods = periodStarts.slice(-2).reverse() // Most recent first

            for (let i = 0; i < recentPeriods.length; i++) {
                const period = recentPeriods[i]
                const startDate = new Date(period.date)

                // Calculate cycle duration (days between this period start and next period start)
                let cycleDuration = averageCycleLength
                if (i < recentPeriods.length - 1) {
                    const nextPeriodStart = new Date(recentPeriods[i + 1].date)
                    cycleDuration = differenceInDays(startDate, nextPeriodStart)
                } else if (data.lastPeriodStart) {
                    // For the most recent period, calculate from lastPeriodStart
                    const lastPeriod = new Date(data.lastPeriodStart)
                    cycleDuration = differenceInDays(startDate, lastPeriod)
                }

                const monthName = startDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

                cycles.push({
                    start_date: period.date,
                    end_date: period.endDate,
                    month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
                    duration: cycleDuration > 0 ? cycleDuration : averageCycleLength
                })
            }

            setCycleHistory(cycles)
        } catch (error) {
            console.error('Failed to load cycle history:', error)
        }
    }

    const handleLogout = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout()
                            router.replace('/splash')
                        } catch (error) {
                            console.error('Logout error:', error)
                            Alert.alert('Error', 'No se pudo cerrar sesión')
                        }
                    },
                },
            ]
        )
    }

    const handleDeleteData = async () => {
        Alert.alert(
            'Borrar todos los datos',
            '¿Estás seguro? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Borrar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await reset()
                            router.replace('/splash')
                        } catch (error) {
                            console.error('Delete error:', error)
                            Alert.alert('Error', 'No se pudieron borrar los datos')
                        }
                    },
                },
            ]
        )
    }

    const formatCycleDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return formatDate(date, 'short')
    }

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
                                    <Text className="text-4xl">👤</Text>
                                </View>

                                <TouchableOpacity
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
                            <View className="mt-4 rounded-full bg-primary/10 px-4 py-1.5">
                                <Text className="text-xs font-bold uppercase tracking-wide text-primary">
                                    USUARIO {plan === 'premium' ? 'PREMIUM' : 'FREE'}
                                </Text>
                            </View>
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

                                return (
                                    <SettingsItem
                                        key={`${cycle.start_date}-${index}`}
                                        icon={index === 0 ? "Clock" : "Check"}
                                        iconBg={index === 0 ? "bg-pink-100" : "bg-purple-100"}
                                        iconColor={index === 0 ? "text-pink-500" : "text-purple-500"}
                                        title={cycle.month}
                                        subtitle={`${startFormatted} - ${endFormatted} • ${cycle.duration} día${cycle.duration > 1 ? 's' : ''}`}
                                        showDivider={index < cycleHistory.length - 1}
                                    />
                                )
                            })}
                            <TouchableOpacity
                                onPress={() => router.push('/history')}
                                className="px-5 py-3"
                            >
                                <Text className="text-sm font-medium text-blue-500">
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

