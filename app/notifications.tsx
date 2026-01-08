import { View, Text, ScrollView, Pressable, TouchableOpacity } from "react-native"
import { useFocusEffect } from "expo-router"
import {
    ArrowLeft,
    Calendar,
    Baby,
    Edit3,
    BarChart3,
    Pill,
    Bell,
    Home,
    Settings,
    CalendarDays,
    ShieldCheck,
    icons,
} from "lucide-react-native"
import MyIcon from "@/components/ui/Icon"
import { useCallback, useEffect, useMemo, useState } from "react"
import { router } from "expo-router"
import { useAlert } from "@/context/AlertContext"
import { useOnboarding } from "@/context/OnboardingContext"
import { useCyclePredictions } from "@/hooks/useCyclePredictions"
import { useNotificationManager } from "@/hooks/useNotificationManager"
import { getAllScheduledNotifications, cancelAllNotifications } from "@/services/notifications"
import { getReadNotifications, markAsRead, markAllAsRead as markAllAsReadService } from "@/services/readNotifications"
import { differenceInDays, differenceInHours, format, isToday as isTodayDate, isYesterday as isYesterdayDate, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

interface Notification {
    id: string
    type: 'period' | 'fertile' | 'daily_log' | 'analysis'
    title: string
    description: string
    icon: string
    iconBg: string
    iconColor: string
    timestamp: Date
    isRead: boolean
    scheduledId?: string
}

function Section({ title, children }: any) {
    return (
        <View className="mb-6">
            <Text className="text-base font-bold uppercase tracking-wider text-text-muted mb-3 px-1">
                {title}
            </Text>
            <View className="gap-3">{children}</View>
        </View>
    )
}

interface NotificationCardProps {
    icon: {
        name: keyof typeof icons;
        size?: number;
        className?: string;
    }
    title: string;
    description: string;
    time: string;
    highlight?: boolean;
    onPress?: () => void;
}

function NotificationCard({ icon, title, description, time, highlight, onPress }: NotificationCardProps) {
    const extraIconBg = useCallback(() => {
        const color = icon.className?.split("-")[1];
        return color === 'primary' ? "bg-primary/10" : `bg-${color}-100`;
    }, [icon.className])

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            className={`flex-row gap-4 p-4 rounded-3xl border bg-white border-gray-200 shadow-md`}
        >
            {highlight && (
                <View className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            )}

            <View className={`w-10 h-10 rounded-full ${extraIconBg()} items-center justify-center`}>
                <MyIcon name={icon.name} size={icon.size} className={icon.className} />
            </View>

            <View className="flex-1">
                <Text className="text-base font-bold text-text-primary">
                    {title}
                </Text>
                <Text className="text-sm text-text-muted mt-1">
                    {description}
                </Text>
                <Text className="text-xs text-text-muted mt-2 font-medium">
                    {time}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

export default function NotificationCenterScreen() {
    const { data } = useOnboarding()
    const { daysUntilPeriod, fertileWindow, cycleDay, nextPeriodResult } = useCyclePredictions(data)
    const { preferences, clearNotifications } = useNotificationManager()
    const { alertError, alertSuccess, confirm } = useAlert()
    const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set())
    const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([])

    // Load scheduled notifications and read status on mount and when screen comes into focus
    useEffect(() => {
        loadScheduledNotifications()
        loadReadNotifications()
    }, [])

    useFocusEffect(
        useCallback(() => {
            loadScheduledNotifications()
            loadReadNotifications()
        }, [])
    )

    const loadReadNotifications = async () => {
        try {
            const readIds = await getReadNotifications()
            setReadNotifications(readIds)
        } catch (error) {
            console.error('Error loading read notifications:', error)
        }
    }

    const loadScheduledNotifications = async () => {
        try {
            const scheduled = await getAllScheduledNotifications()
            setScheduledNotifications(scheduled)
        } catch (error) {
            console.error('Error loading scheduled notifications:', error)
        }
    }

    // Generate notifications based on cycle data and scheduled notifications
    const notifications = useMemo<Notification[]>(() => {
        const notifs: Notification[] = []
        const now = new Date()

        // Period approaching notification (show if within 3 days)
        if (daysUntilPeriod <= 3 && daysUntilPeriod > 0 && preferences?.periodReminders.enabled) {
            const scheduledPeriodNotif = scheduledNotifications.find(n =>
                n.identifier.startsWith('period-reminder-') &&
                n.trigger &&
                typeof n.trigger === 'object' &&
                'date' in n.trigger
            )

            notifs.push({
                id: 'period-approaching',
                type: 'period',
                title: 'Tu periodo se acerca',
                description: `Según nuestras predicciones, comenzará en ${daysUntilPeriod} día${daysUntilPeriod > 1 ? 's' : ''}. Prepárate.`,
                icon: 'Calendar',
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-500',
                timestamp: scheduledPeriodNotif && 'date' in scheduledPeriodNotif.trigger
                    ? new Date(scheduledPeriodNotif.trigger.date as number)
                    : new Date(now.getTime() - 2 * 60 * 60 * 1000),
                isRead: readNotifications.has('period-approaching'),
                scheduledId: scheduledPeriodNotif?.identifier
            })
        }

        // Fertile window notification
        if (
            fertileWindow &&
            cycleDay >= fertileWindow.startDay &&
            cycleDay <= fertileWindow.endDay &&
            preferences?.fertileWindowReminders.enabled
        ) {
            const scheduledFertileNotif = scheduledNotifications.find(n =>
                n.identifier.startsWith('fertile-window-')
            )

            notifs.push({
                id: 'fertile-window',
                type: 'fertile',
                title: 'Ventana fértil',
                description: 'Estás en tus días de mayor fertilidad del ciclo.',
                icon: 'Baby',
                iconBg: 'bg-purple-50',
                iconColor: 'text-purple-500',
                timestamp: scheduledFertileNotif && scheduledFertileNotif.trigger && typeof scheduledFertileNotif.trigger === 'object' && 'date' in scheduledFertileNotif.trigger
                    ? new Date(scheduledFertileNotif.trigger.date as number)
                    : new Date(now.getTime() - 24 * 60 * 60 * 1000 + 9.5 * 60 * 60 * 1000),
                isRead: readNotifications.has('fertile-window'),
                scheduledId: scheduledFertileNotif?.identifier
            })
        }

        // Daily log reminder (show if enabled)
        if (preferences?.dailyLogReminder.enabled) {
            const scheduledDailyLog = scheduledNotifications.find(n =>
                n.identifier.startsWith('daily-log-')
            )

            notifs.push({
                id: 'daily-log',
                type: 'daily_log',
                title: 'Registro diario',
                description: '¿Cómo te sientes hoy? Recuerda registrar tus síntomas.',
                icon: 'PenTool',
                iconBg: 'bg-pink-50',
                iconColor: 'text-pink-500',
                timestamp: scheduledDailyLog && scheduledDailyLog.trigger && typeof scheduledDailyLog.trigger === 'object' && 'hour' in scheduledDailyLog.trigger
                    ? (() => {
                        const today = new Date()
                        today.setHours((scheduledDailyLog.trigger as any).hour || 20, (scheduledDailyLog.trigger as any).minute || 0, 0, 0)
                        return today
                    })()
                    : new Date(now.getTime() - 24 * 60 * 60 * 1000 + 20 * 60 * 60 * 1000),
                isRead: readNotifications.has('daily-log'),
                scheduledId: scheduledDailyLog?.identifier
            })
        }

        // Add upcoming scheduled notifications
        scheduledNotifications.forEach((scheduled) => {
            if (scheduled.trigger && typeof scheduled.trigger === 'object' && 'date' in scheduled.trigger) {
                const triggerDate = new Date(scheduled.trigger.date as number)
                const now = new Date()

                // Only show future notifications that aren't already shown above
                if (triggerDate.getTime() > now.getTime() && !notifs.find(n => n.scheduledId === scheduled.identifier)) {
                    const content = scheduled.content
                    const notificationType = content?.data?.type || 'analysis'

                    let iconName = 'Bell'
                    let iconBg = 'bg-gray-50'
                    let iconColor = 'text-gray-500'

                    if (notificationType === 'period') {
                        iconName = 'Calendar'
                        iconBg = 'bg-blue-50'
                        iconColor = 'text-blue-500'
                    } else if (notificationType === 'fertile') {
                        iconName = 'Baby'
                        iconBg = 'bg-purple-50'
                        iconColor = 'text-purple-500'
                    } else if (notificationType === 'daily_log') {
                        iconName = 'PenTool'
                        iconBg = 'bg-pink-50'
                        iconColor = 'text-pink-500'
                    }

                    notifs.push({
                        id: `scheduled-${scheduled.identifier}`,
                        type: notificationType as any,
                        title: content?.title || 'Notificación programada',
                        description: content?.body || 'Tienes una notificación programada.',
                        icon: iconName,
                        iconBg: iconBg,
                        iconColor: iconColor,
                        timestamp: triggerDate,
                        isRead: readNotifications.has(`scheduled-${scheduled.identifier}`),
                        scheduledId: scheduled.identifier
                    })
                }
            }
        })

        // Sort by timestamp (most recent first)
        return notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }, [daysUntilPeriod, fertileWindow, cycleDay, readNotifications, scheduledNotifications, preferences])

    const formatTimestamp = (date: Date) => {
        const now = new Date()
        const hoursDiff = differenceInHours(now, date)
        const daysDiff = differenceInDays(now, date)

        if (hoursDiff < 1) {
            return 'Hace unos minutos'
        } else if (hoursDiff < 24) {
            return `Hace ${hoursDiff} hora${hoursDiff > 1 ? 's' : ''}`
        } else if (daysDiff === 1) {
            return `Ayer, ${format(date, 'HH:mm', { locale: es })}`
        } else if (daysDiff < 7) {
            return format(date, 'EEE, d MMM', { locale: es })
        } else {
            return format(date, 'd MMM yyyy', { locale: es })
        }
    }

    const formatTime = (date: Date) => {
        return format(date, 'HH:mm', { locale: es })
    }

    // Group notifications by date
    const groupedNotifications = useMemo(() => {
        const groups: { [key: string]: Notification[] } = {}
        const now = new Date()

        notifications.forEach(notif => {
            const notifDate = startOfDay(notif.timestamp)
            const today = startOfDay(now)
            const yesterday = startOfDay(new Date(now.getTime() - 24 * 60 * 60 * 1000))

            let groupKey = ''
            if (isTodayDate(notif.timestamp)) {
                groupKey = 'Hoy'
            } else if (isYesterdayDate(notif.timestamp)) {
                groupKey = 'Ayer'
            } else {
                groupKey = format(notif.timestamp, 'EEEE, d MMMM', { locale: es })
            }

            if (!groups[groupKey]) {
                groups[groupKey] = []
            }
            groups[groupKey].push(notif)
        })

        return groups
    }, [notifications])

    const unreadCount = notifications.filter(n => !n.isRead).length

    const handleMarkAllRead = async () => {
        const allIds = notifications.map(n => n.id)
        try {
            await markAllAsReadService(allIds)
            setReadNotifications(new Set(allIds))
        } catch (error) {
            console.error('Error marking all as read:', error)
            alertError('Error', 'No se pudieron marcar las notificaciones como leídas.')
        }
    }

    const handleDeleteAll = async () => {
        confirm(
            'Eliminar todas las notificaciones',
            '¿Estás seguro que deseas eliminar todas las notificaciones programadas?',
            async () => {
                try {
                    await clearNotifications()
                    await loadScheduledNotifications()
                    alertSuccess('Éxito', 'Todas las notificaciones han sido eliminadas.')
                } catch (error) {
                    alertError('Error', 'No se pudieron eliminar las notificaciones.')
                }
            }
        )
    }

    const handleNotificationPress = async (notification: Notification) => {
        // Mark as read
        try {
            await markAsRead(notification.id)
            setReadNotifications(prev => new Set([...prev, notification.id]))
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }

        // Navigate based on type
        if (notification.type === 'daily_log') {
            router.push('/register')
        } else if (notification.type === 'period' || notification.type === 'fertile') {
            router.push('/(tabs)/predictions')
        }
    }

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="absolute top-0 left-0 right-0 z-20 flex gap-4 items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
                <View className="flex-row items-center justify-between w-full">
                    <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-background">
                        <MyIcon name="ArrowLeft" className="text-text-primary" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-text-primary">
                        Centro de Notificaciones
                    </Text>
                    <View className="w-10" />
                </View>
                {/* Actions */}
                <View className="flex-row justify-between w-full">
                    <TouchableOpacity
                        onPress={handleMarkAllRead}
                        disabled={unreadCount === 0}
                        activeOpacity={0.7}
                        className={`px-4 py-2 rounded-full ${unreadCount > 0 ? 'bg-primary/20' : 'bg-gray-100'}`}
                    >
                        <Text className={`text-sm font-semibold ${unreadCount > 0 ? 'text-primary' : 'text-gray-400'}`}>
                            Marcar todas leídas
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleDeleteAll}
                        disabled={scheduledNotifications.length === 0}
                        activeOpacity={0.7}
                        className={`px-4 py-2 rounded-full ${scheduledNotifications.length > 0 ? 'bg-red-50' : 'bg-gray-100'}`}
                    >
                        <Text className={`text-sm font-semibold ${scheduledNotifications.length > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            Eliminar todas
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                className="flex-1 px-4 pt-4"
                showsVerticalScrollIndicator={false}
            >
                <View className="h-32" />

                {Object.keys(groupedNotifications).length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <MyIcon name="Bell" size={48} className="text-gray-300" />
                        <Text className="text-lg font-semibold text-text-muted mt-4">
                            No hay notificaciones
                        </Text>
                        <Text className="text-sm text-text-muted mt-2 text-center">
                            Las notificaciones programadas aparecerán aquí
                        </Text>
                    </View>
                ) : (
                    Object.entries(groupedNotifications).map(([groupKey, groupNotifications]) => (
                        <Section key={groupKey} title={groupKey}>
                            {groupNotifications.map((notification) => {
                                const isTodayNotif = isTodayDate(notification.timestamp)
                                const timeDisplay = isTodayNotif
                                    ? formatTimestamp(notification.timestamp)
                                    : formatTime(notification.timestamp)

                                return (
                                    <NotificationCard
                                        key={notification.id}
                                        icon={{
                                            name: notification.icon as any,
                                            size: 20,
                                            className: notification.iconColor
                                        }}
                                        highlight={!notification.isRead}
                                        title={notification.title}
                                        description={notification.description}
                                        time={timeDisplay}
                                        onPress={() => handleNotificationPress(notification)}
                                    />
                                )
                            })}
                        </Section>
                    ))
                )}

                {/* Footer */}
                <View className="flex-row items-center justify-center gap-2 mt-6 mb-24 opacity-60">
                    <ShieldCheck size={14} className="text-textMuted dark:text-gray-500" />
                    <Text className="text-xs font-medium text-textMuted dark:text-gray-500">
                        Fin de las notificaciones
                    </Text>
                </View>
            </ScrollView>
        </View>
    )
}
