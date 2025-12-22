import {
    View,
    Text,
    ScrollView,
    Pressable,
    ImageBackground,
    useColorScheme,
} from "react-native";
import {
    Bell,
    Sparkles,
    Egg,
    Flower,
    ShieldCheck,
    Calendar,
    CalendarDays,
    BarChart3,
    User,
} from "lucide-react-native";

export default function PredictionsS() {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";
    const icon = isDark ? "#e5e7eb" : "#111318";

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 border-b border-gray-200 dark:border-gray-800">
                <View className="flex-row items-center justify-between px-4 py-3 max-w-lg mx-auto">
                    <Text className="text-2xl font-bold text-text-main dark:text-white">
                        Predicciones
                    </Text>
                    <Pressable className="p-2 rounded-full">
                        <Bell size={22} color={icon} />
                    </Pressable>
                </View>
            </View>

            {/* Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerClassName="px-4 pt-3 pb-36 gap-6 max-w-lg mx-auto"
            >
                {/* Hero Card */}
                <View className="rounded-xl overflow-hidden bg-white dark:bg-surface-dark shadow-sm">
                    <ImageBackground
                        source={{
                            uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuADYt505TH4cOvY-57cAwJi2Vv46C1raokpDxZt5LAS5I4EYOjjIpVN0YP-D6XznmqCAksIi1YOrp7WqMamK-G3UvxnTw8T72pOL19-zLZEafz9sj8GKsC9vsiIqdjMUb8iqvzkk6G99zpaLKzS1ryMPObUxbAhBhYOjGuFm8H7e8NM3H_iAELoSQMJEyfi3Mo_8d2c4j7b5gXTsqS4UevZfb3Miq1EpQnT7OwoSNdZoCw9XkLnhkajqgMhNSRUKtzU1CW9rmnh6ns",
                        }}
                        className="h-48 justify-end"
                    >
                        <View className="absolute inset-0 bg-black/30" />
                        <View className="p-4">
                            <Text className="text-xs uppercase tracking-wider text-white/80 mb-1">
                                Tu próximo periodo
                            </Text>
                            <View className="flex-row items-end justify-between">
                                <Text className="text-4xl font-bold text-white">14 Oct</Text>
                                <View className="bg-primary px-3 py-1 rounded-full">
                                    <Text className="text-white text-sm font-medium">
                                        En 5 días
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>

                    {/* Week Strip */}
                    <View className="flex-row justify-between px-4 py-4 border-t border-gray-100 dark:border-gray-800">
                        {[
                            { d: "L", n: 9, faded: true },
                            { d: "M", n: 10, faded: true },
                            { d: "X", n: 11, active: true },
                            { d: "J", n: 12 },
                            { d: "V", n: 13, highlight: true },
                            { d: "S", n: 14, period: true },
                            { d: "D", n: 15, period: true, soft: true },
                        ].map((day) => (
                            <View key={day.n} className="items-center gap-1">
                                <Text
                                    className={`text-xs ${day.active
                                        ? "text-primary font-bold"
                                        : "text-text-secondary dark:text-text-secondary-dark"
                                        }`}
                                >
                                    {day.d}
                                </Text>

                                <View
                                    className={`w-8 h-8 rounded-full items-center justify-center ${day.active
                                        ? "bg-primary"
                                        : day.period
                                            ? "bg-[#e96e7e]"
                                            : ""
                                        }`}
                                >
                                    <Text
                                        className={`text-sm font-bold ${day.active || day.period
                                            ? "text-white"
                                            : "text-text-main dark:text-white"
                                            }`}
                                    >
                                        {day.n}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Details */}
                <View>
                    <Text className="text-lg font-bold mb-3 text-text-main dark:text-white">
                        Detalles del ciclo
                    </Text>

                    <View className="flex-row gap-3">
                        {/* Ovulation */}
                        <View className="flex-1 bg-white dark:bg-surface-dark rounded-xl p-5 shadow-sm gap-3">
                            <View className="flex-row justify-between items-center">
                                <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center">
                                    <Egg size={18} color="#9333ea" />
                                </View>
                                <Text className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                    Alta
                                </Text>
                            </View>
                            <Text className="text-sm text-text-secondary dark:text-text-secondary-dark">
                                Ovulación
                            </Text>
                            <Text className="text-xl font-bold text-text-main dark:text-white">
                                28 Oct
                            </Text>
                        </View>

                        {/* Fertile */}
                        <View className="flex-1 bg-white dark:bg-surface-dark rounded-xl p-5 shadow-sm gap-3">
                            <View className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 items-center justify-center">
                                <Flower size={18} color="#0d9488" />
                            </View>
                            <Text className="text-sm text-text-secondary dark:text-text-secondary-dark">
                                Ventana fértil
                            </Text>
                            <Text className="text-xl font-bold text-text-main dark:text-white">
                                24 – 29 Oct
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Contraceptive */}
                <View className="bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-5 gap-4">
                    <View className="flex-row gap-3">
                        <ShieldCheck size={22} color="#256af4" />
                        <View className="flex-1 gap-1">
                            <Text className="font-bold text-text-main dark:text-white">
                                Método anticonceptivo
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-text-secondary-dark">
                                Tu método actual (Píldora) reduce significativamente el riesgo de
                                embarazo.
                            </Text>
                        </View>
                    </View>

                    <Pressable className="self-start bg-primary px-5 py-2 rounded-full">
                        <Text className="text-white font-medium text-sm">
                            Ver detalles
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

/* ---------- Nav Item ---------- */
function NavItem({
    icon: Icon,
    label,
    active,
}: {
    icon: any;
    label: string;
    active?: boolean;
}) {
    return (
        <View className="items-center gap-1 w-16">
            <Icon size={22} color={active ? "#256af4" : "#9ca3af"} />
            <Text
                className={`text-[10px] ${active ? "font-bold text-primary" : "text-gray-400"
                    }`}
            >
                {label}
            </Text>
        </View>
    );
}
