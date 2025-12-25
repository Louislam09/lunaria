import { View, Text, ScrollView, Pressable, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
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
import { useCallback } from "react"

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
}

function NotificationCard({ icon, title, description, time, highlight }: NotificationCardProps) {

    const extraIconBg = useCallback(() => {
        const color = icon.className?.split("-")[1];
        return color === 'primary' ? "bg-primary/10" : `bg-${color}-100`;
    }, [icon.className])
    return (
        <View
            className={`flex-row gap-4 p-4 rounded-3xl border bg-white border-gray-200 shadow-md`}
        >
            {highlight && (
                <View className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            )}

            {/* <View className={`w-10 h-10 rounded-full ${iconBg} items-center justify-center`}>
                <MyIcon name={icon} size={20} className={iconColor} />
            </View> */}
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
        </View>
    )
}



export default function NotificationCenterScreen() {
    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="absolute top-0 left-0 right-0 z-20 flex gap-4 items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
                <View className="flex-row items-center justify-between w-full">
                    <Text className="text-2xl font-bold text-text-primary">
                        Centro de Notificaciones
                    </Text>

                    <TouchableOpacity className="hidden h-10 w-10 items-center justify-center rounded-full bg-background">
                        <MyIcon name="Bell" className="text-text-primary" />
                    </TouchableOpacity>
                </View>
                {/* Actions */}
                <View className="flex-row justify-between w-full">
                    <TouchableOpacity className="px-4 py-2 rounded-full bg-primary/20 active:scale-95">
                        <Text className="text-sm font-semibold text-primary">
                            Marcar todas leídas
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="px-4 py-2 rounded-full bg-red-50 active:scale-95">
                        <Text className="text-sm font-semibold text-red-500">
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

                {/* === HOY === */}
                <Section title="Hoy">
                    <NotificationCard
                        icon={{ name: "Calendar", size: 20, className: "text-blue-500" }}
                        highlight
                        title="Tu periodo se acerca"
                        description="Según nuestras predicciones, comenzará en 2 días. Prepárate."
                        time="Hace 2 horas"
                    />

                    <NotificationCard
                        icon={{ name: "Baby", size: 20, className: "text-purple-500" }}
                        title="Ventana fértil"
                        description="Estás en tus días de mayor fertilidad del ciclo."
                        time="9:30 AM"
                    />
                </Section>


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
