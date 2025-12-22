import { View, Text, ScrollView, Pressable, TextInput, useColorScheme } from "react-native";
import {
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Smile,
    Frown,
    Angry,
    Droplet,
    AlertCircle,
    Brain,
    Activity,
    BatteryLow,
    PencilLine,
    Check
} from "lucide-react-native";
import { useState } from "react";

export default function DailyLogScreen() {
    const scheme = useColorScheme();
    const isDark = scheme === "dark";

    const iconColor = isDark ? "#e5e7eb" : "#1f2937";

    const [flow, setFlow] = useState("medio");
    const [moods, setMoods] = useState<string[]>(["triste"]);

    const toggleMood = (mood: string) => {
        setMoods((prev) =>
            prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
        );
    };

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#101622]/90">
                <View className="flex-row items-center justify-between px-4 py-3 max-w-lg mx-auto">
                    <Pressable className="h-10 w-10 items-center justify-center rounded-full">
                        <ChevronLeft size={26} color={iconColor} />
                    </Pressable>

                    <View className="items-center">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white">
                            Lunes, 24 Oct
                        </Text>
                        <Text className="text-xs font-semibold uppercase tracking-wider text-primary">
                            Ciclo Día 14
                        </Text>
                    </View>

                    <Pressable className="h-10 w-10 items-center justify-center rounded-full">
                        <ChevronRight size={26} color={iconColor} />
                    </Pressable>
                </View>
            </View>

            <ScrollView
                contentContainerClassName="px-4 pt-4 pb-32 gap-6 max-w-lg mx-auto"
                showsVerticalScrollIndicator={false}
            >
                {/* Prediction */}
                <View className="flex-row items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl p-4">
                    <Sparkles size={18} color="#256af4" />
                    <Text className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Predicción: Posible inicio de periodo hoy.
                    </Text>
                </View>

                {/* Menstruación */}
                <View>
                    <Text className="text-lg font-bold mb-3 text-slate-900 dark:text-white">
                        Menstruación
                    </Text>

                    <View className="flex-row bg-white dark:bg-slate-800 rounded-xl p-1.5 border border-slate-200 dark:border-slate-700">
                        {["leve", "medio", "alto", "mancha"].map((item) => (
                            <Pressable
                                key={item}
                                onPress={() => setFlow(item)}
                                className={`flex-1 py-2.5 rounded-lg ${flow === item ? "bg-primary" : ""
                                    }`}
                            >
                                <Text
                                    className={`text-center text-sm font-medium ${flow === item
                                            ? "text-white"
                                            : "text-slate-500 dark:text-slate-400"
                                        }`}
                                >
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Estado de ánimo */}
                <View>
                    <Text className="text-lg font-bold mb-3 text-slate-900 dark:text-white">
                        Estado de Ánimo
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
                        <View className="flex-row gap-3">
                            {[
                                { key: "feliz", label: "Feliz", icon: Smile, color: "#facc15" },
                                { key: "triste", label: "Triste", icon: Frown, color: "#256af4" },
                                { key: "irritable", label: "Irritable", icon: Angry, color: "#ef4444" },
                                { key: "sensible", label: "Sensible", icon: Droplet, color: "#60a5fa" },
                                { key: "ansiosa", label: "Ansiosa", icon: AlertCircle, color: "#a855f7" }
                            ].map(({ key, label, icon: Icon, color }) => {
                                const active = moods.includes(key);
                                return (
                                    <Pressable
                                        key={key}
                                        onPress={() => toggleMood(key)}
                                        className={`w-20 h-24 rounded-2xl items-center justify-center gap-2 border ${active
                                                ? "border-primary bg-primary/5"
                                                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                            }`}
                                    >
                                        <Icon size={28} color={active ? "#256af4" : color} />
                                        <Text
                                            className={`text-xs ${active
                                                    ? "font-bold text-primary"
                                                    : "font-medium text-slate-600 dark:text-slate-300"
                                                }`}
                                        >
                                            {label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>

                {/* Síntomas */}
                <View>
                    <Text className="text-lg font-bold mb-3 text-slate-900 dark:text-white">
                        Síntomas Físicos
                    </Text>

                    <View className="flex-row flex-wrap gap-2">
                        {[
                            { label: "Cólicos", icon: Activity },
                            { label: "Dolor de cabeza", icon: Brain },
                            { label: "Acné", icon: AlertCircle },
                            { label: "Dolor de espalda", icon: Activity },
                            { label: "Fatiga", icon: BatteryLow }
                        ].map(({ label, icon: Icon }) => (
                            <View
                                key={label}
                                className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                            >
                                <Icon size={16} color={iconColor} />
                                <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                    {label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Notas */}
                <View>
                    <Text className="text-lg font-bold mb-3 text-slate-900 dark:text-white">
                        Notas
                    </Text>

                    <View className="relative">
                        <TextInput
                            multiline
                            numberOfLines={4}
                            placeholder="¿Algo más que notar hoy?"
                            placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-slate-900 dark:text-white"
                        />
                        <View className="absolute bottom-3 right-3">
                            <PencilLine size={18} color="#94a3b8" />
                        </View>
                    </View>
                </View>

                {/* Save */}
                <Pressable className="flex-row items-center justify-center gap-2 bg-primary py-4 rounded-full shadow-lg shadow-primary/30">
                    <Check size={20} color="white" />
                    <Text className="text-white font-bold text-base">
                        Guardar Registro
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    );
}
