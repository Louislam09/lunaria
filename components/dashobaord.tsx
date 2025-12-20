import { View, Text, ScrollView, Pressable, Image } from "react-native"
import Svg, { Circle } from "react-native-svg"
import { MaterialIcons } from "@expo/vector-icons"

export default function DashboardScreen() {
    return (
        <View className="flex-1 bg-[#f5f6f8] dark:bg-[#101622]">

            {/* Header */}
            <View className="px-4 pt-6 pb-2 flex-row justify-between items-center">
                <View>
                    <Text className="text-sm text-gray-500">Buenos días</Text>
                    <Text className="text-2xl font-bold text-black dark:text-white">
                        Hola, María
                    </Text>
                </View>

                <View className="flex-row gap-3">
                    <Pressable className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 items-center justify-center">
                        <MaterialIcons name="notifications-none" size={24} color="white" />
                    </Pressable>

                    <Image
                        source={{ uri: "https://i.pravatar.cc/100" }}
                        className="h-10 w-10 rounded-full"
                    />
                </View>
            </View>

            {/* Scroll content */}
            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>

                {/* Next period card */}
                <View className="mt-6 bg-white dark:bg-[#1a2230] rounded-[40px] p-6 items-center">
                    <Text className="uppercase text-sm text-gray-400 mb-4">
                        Próximo periodo
                    </Text>

                    {/* Circular counter */}
                    <View className="w-48 h-48 items-center justify-center">
                        <Svg width="100%" height="100%" viewBox="0 0 100 100">
                            <Circle
                                cx="50"
                                cy="50"
                                r="42"
                                stroke="#e5e7eb"
                                strokeWidth="6"
                                fill="none"
                            />
                            <Circle
                                cx="50"
                                cy="50"
                                r="42"
                                stroke="#256af4"
                                strokeWidth="6"
                                strokeDasharray="264"
                                strokeDashoffset="60"
                                strokeLinecap="round"
                                fill="none"
                                rotation="-90"
                                origin="50,50"
                            />
                        </Svg>

                        <View className="absolute items-center">
                            <Text className="text-6xl font-bold text-black dark:text-white">
                                5
                            </Text>
                            <Text className="text-gray-400">días</Text>
                        </View>
                    </View>

                    <Text className="text-lg font-bold mt-4 dark:text-white">
                        Jueves, 24 de Octubre
                    </Text>

                    <View className="mt-2 px-3 py-1 rounded-full bg-blue-100">
                        <Text className="text-blue-600 text-sm font-semibold">
                            Predicción regular
                        </Text>
                    </View>
                </View>

                {/* Current phase */}
                <View className="mt-6 bg-blue-50 dark:bg-[#1a2230] rounded-[32px] p-5">
                    <View className="flex-row items-center gap-2 mb-2">
                        <MaterialIcons name="water-drop" size={20} color="#256af4" />
                        <Text className="text-blue-600 font-bold uppercase text-sm">
                            Estado actual
                        </Text>
                    </View>

                    <Text className="text-2xl font-bold dark:text-white">
                        Fase Lútea
                    </Text>

                    <Text className="text-gray-500 mt-2">
                        Día 19 del ciclo. Tu energía puede empezar a disminuir.
                    </Text>

                    <Pressable className="mt-4 bg-blue-600 h-12 rounded-full items-center justify-center flex-row gap-2">
                        <MaterialIcons name="edit-note" size={20} color="white" />
                        <Text className="text-white font-bold">
                            Registrar síntomas
                        </Text>
                    </Pressable>
                </View>

                {/* Insights */}
                <Text className="mt-8 mb-4 text-xl font-bold dark:text-white">
                    Resumen de hoy
                </Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[
                        { icon: "wb-sunny", title: "Estado de ánimo", text: "Más introspectiva hoy" },
                        { icon: "self-improvement", title: "Recomendación", text: "Yoga suave o meditación" }
                    ].map((item, i) => (
                        <View
                            key={i}
                            className="w-64 mr-4 bg-white dark:bg-[#1a2230] p-4 rounded-2xl"
                        >
                            <View className="h-10 w-10 rounded-full bg-orange-100 items-center justify-center mb-3">
                                <MaterialIcons name={item.icon as any} size={20} />
                            </View>

                            <Text className="font-bold dark:text-white">
                                {item.title}
                            </Text>

                            <Text className="text-gray-500 mt-1">
                                {item.text}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                <View className="h-32" />
            </ScrollView>

            {/* Bottom nav */}
            <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#101622] border-t border-gray-200 px-6 py-3 flex-row justify-between">
                {["home", "calendar-month", "bar-chart", "settings"].map((icon, i) => (
                    <Pressable key={i} className="items-center">
                        <MaterialIcons
                            name={icon as any}
                            size={26}
                            color={i === 0 ? "#256af4" : "#9ca3af"}
                        />
                        <Text className={`text-xs ${i === 0 ? "text-blue-600" : "text-gray-400"}`}>
                            {["Inicio", "Calendario", "Reportes", "Ajustes"][i]}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    )
}
