import MyIcon from "@/components/ui/Icon"
import { useOnboarding } from "@/context/OnboardingContext"
import { useCyclePredictions } from "@/hooks/useCyclePredictions"
import { differenceInDays, differenceInHours, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { router } from "expo-router"
import { useMemo, useState } from "react"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"

interface Notification {
    id: string
    type: 'period' | 'fertile' | 'daily_log' | 'analysis'
    title: string
    message: string
    icon: string
    iconBg: string
    iconColor: string
    timestamp: Date
    isRead: boolean
}

interface NotificationsMenuProps {
    onMenuClose: () => void
}

export function NotificationsMenu({ onMenuClose }: NotificationsMenuProps) {
    const { data } = useOnboarding()
    const { daysUntilPeriod, fertileWindow, cycleDay } = useCyclePredictions(data)
    const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set())

    // Generate notifications based on cycle data
    const notifications = useMemo<Notification[]>(() => {
        const notifs: Notification[] = []
        const now = new Date()

        // Period approaching notification
        if (daysUntilPeriod <= 3 && daysUntilPeriod > 0) {
            notifs.push({
                id: 'period-approaching',
                type: 'period',
                title: 'Tu periodo se acerca',
                message: `Según nuestras predicciones, comenzará en ${daysUntilPeriod} día${daysUntilPeriod > 1 ? 's' : ''}. Prepárate.`,
                icon: 'Calendar',
                iconBg: 'bg-blue-50 dark:bg-blue-900/20',
                iconColor: 'text-blue-500 dark:text-blue-400',
                timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
                isRead: readNotifications.has('period-approaching')
            })
        }

        // Fertile window notification
        if (fertileWindow && cycleDay >= fertileWindow.startDay && cycleDay <= fertileWindow.endDay) {
            notifs.push({
                id: 'fertile-window',
                type: 'fertile',
                title: 'Ventana fértil',
                message: 'Estás en tus días de mayor fertilidad del ciclo.',
                icon: 'Baby',
                iconBg: 'bg-purple-50 dark:bg-purple-900/20',
                iconColor: 'text-purple-500 dark:text-purple-400',
                timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 9.5 * 60 * 60 * 1000), // Yesterday 9:30 AM
                isRead: readNotifications.has('fertile-window')
            })
        }

        // Daily log reminder
        notifs.push({
            id: 'daily-log',
            type: 'daily_log',
            title: 'Registro diario',
            message: '¿Cómo te sientes hoy? Recuerda registrar tus síntomas.',
            icon: 'PenTool',
            iconBg: 'bg-pink-50 dark:bg-pink-900/20',
            iconColor: 'text-pink-500',
            timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000), // Yesterday 8:00 PM
            isRead: readNotifications.has('daily-log')
        })

        // Analysis notification (example)
        notifs.push({
            id: 'analysis',
            type: 'analysis',
            title: 'Nuevo análisis disponible',
            message: 'Tu resumen del mes pasado está listo.',
            icon: 'TrendingUp',
            iconBg: 'bg-green-50 dark:bg-green-900/20',
            iconColor: 'text-green-500 dark:text-green-400',
            timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            isRead: readNotifications.has('analysis')
        })

        // Sort by timestamp (most recent first)
        return notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }, [daysUntilPeriod, fertileWindow, cycleDay, readNotifications])

    const unreadCount = notifications.filter(n => !n.isRead).length

    const formatTimestamp = (date: Date) => {
        const now = new Date()
        const hoursDiff = differenceInHours(now, date)
        const daysDiff = differenceInDays(now, date)

        if (hoursDiff < 1) {
            return 'Hace unos minutos'
        } else if (hoursDiff < 24) {
            return `Hace ${hoursDiff} hora${hoursDiff > 1 ? 's' : ''}`
        } else if (daysDiff === 1) {
            return `Ayer, ${format(date, 'h:mm a', { locale: es })}`
        } else if (daysDiff < 7) {
            return format(date, 'EEE, d MMM', { locale: es })
        } else {
            return format(date, 'd MMM', { locale: es })
        }
    }

    const handleMarkAllRead = () => {
        const allIds = notifications.map(n => n.id)
        setReadNotifications(new Set(allIds))
    }

    const handleNotificationPress = (notification: Notification) => {
        // Mark as read
        setReadNotifications(prev => new Set([...prev, notification.id]))
        onMenuClose()

        // Navigate based on type
        if (notification.type === 'daily_log') {
            router.push('/registro')
        } else if (notification.type === 'period' || notification.type === 'fertile') {
            router.push('/(tabs)/predictions')
        }
    }

    return (
        <View className="w-74 rounded-3xl shadow-xl border border-gray-100 px-1 pb-3 overflow-hidden">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
                <Text className="text-lg font-bold text-text-primary">
                    Notificaciones
                </Text>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={handleMarkAllRead}>
                        <Text className="text-xs font-semibold text-primary">
                            Marcar leídas
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Notifications List */}
            <ScrollView
                className="w-full"
                contentContainerClassName="gap-3 px-3 pb-1"
                showsVerticalScrollIndicator={false}
            >
                {notifications.map((notification) => {
                    const isUnread = !notification.isRead
                    return (
                        <TouchableOpacity
                            key={notification.id}
                            onPress={() => handleNotificationPress(notification)}
                            activeOpacity={0.7}
                            className={`flex-row gap-3 p-3 border border-gray-200 bg-white  rounded-2xl`}
                        >
                            {/* Unread indicator */}
                            {isUnread && (
                                <View className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
                            )}

                            {/* Icon */}
                            <View className={`w-8 h-8 rounded-full ${notification.iconBg} items-center justify-center  mt-0.5`}>
                                <MyIcon
                                    name={notification.icon as any}
                                    size={18}
                                    className={notification.iconColor}
                                />
                            </View>

                            {/* Content */}
                            <View className="flex-1 flex-col">
                                <Text className="text-sm font-semibold text-text-primary leading-tight">
                                    {notification.title}
                                </Text>
                                <Text className="text-xs text-text-muted mt-1 leading-relaxed">
                                    {notification.message}
                                </Text>
                                <Text className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                    {formatTimestamp(notification.timestamp)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>

            {/* Footer */}
            <TouchableOpacity
                onPress={() => {
                    onMenuClose()
                    router.push('/notifications')
                }}
                className="flex-row items-center justify-center p-3 rounded-2xl  active:scale-[0.98]"
            >
                <View className="flex-row items-center gap-3">
                    <Text className="text-base font-semibold text-red-500">
                        Ver todas las notificaciones
                    </Text>
                    <MyIcon name="ChevronRight" size={20} className="text-red-500" />
                </View>
            </TouchableOpacity>

        </View>
    )
}

