import { View, Text, Pressable, Image, SafeAreaView } from "react-native"
import { Calendar } from "react-native-calendars"
import { useMemo } from "react"
import { Ionicons } from "@expo/vector-icons"

const colors = {
    primary: "#256af4",
    bgLight: "#f8f9fc",
    bgDark: "#101622",
    red: "#fb7185",
    pink: "#f472b6",
    purple: "#c084fc",
}

function buildMarkedDates() {
    return {
        // Period (4–8)
        "2023-10-04": { startingDay: true, color: colors.red },
        "2023-10-05": { color: colors.red },
        "2023-10-06": { color: colors.red },
        "2023-10-07": { color: colors.red },
        "2023-10-08": { endingDay: true, color: colors.red },

        // Fertile window
        "2023-10-13": { marked: true, dotColor: colors.pink },
        "2023-10-14": { marked: true, dotColor: colors.pink },
        "2023-10-16": { marked: true, dotColor: colors.pink },

        // Ovulation
        "2023-10-15": {
            customStyles: {
                container: {
                    borderWidth: 2,
                    borderColor: colors.purple,
                    backgroundColor: "#f5f3ff",
                },
                text: {
                    color: colors.purple,
                    fontWeight: "700",
                },
            },
        },

        // Today
        "2023-10-17": {
            selected: true,
            selectedColor: colors.primary,
        },
    }
}


export default function CalendarScreen() {
    const markedDates = useMemo(buildMarkedDates, [])

    return (
        <SafeAreaView className="flex-1 bg-[#f8f9fc] dark:bg-[#101622]">
            {/* ───── Top Bar ───── */}
            <View className="sticky top-0 z-10 px-4 py-3 flex-row items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-[#f8f9fc]/95 dark:bg-[#101622]/95">
                <Pressable className="size-10 items-center justify-center rounded-full">
                    <Ionicons name="chevron-back" size={22} color="#111318" />
                </Pressable>

                <Text className="text-lg font-bold dark:text-white">
                    Octubre 2023
                </Text>

                <Pressable className="px-3 py-1.5 rounded-full bg-primary/10">
                    <Text className="text-primary font-bold text-sm">Hoy</Text>
                </Pressable>
            </View>

            {/* ───── Calendar ───── */}
            <View className="px-4 pt-2">
                <Calendar
                    current="2023-10-01"
                    markingType="period"
                    markedDates={markedDates}
                    enableSwipeMonths
                    dayComponent={({ date, state }) => {
                        const isToday = date?.dateString === "2023-10-17"

                        return (
                            <View className="items-center justify-center h-11">
                                <View
                                    className={`size-9 items-center justify-center rounded-full ${isToday ? "bg-[#256af4]" : ""
                                        }`}
                                >
                                    <Text
                                        className={`text-sm ${isToday
                                            ? "text-white font-bold"
                                            : "text-[#111318] dark:text-white"
                                            }`}
                                    >
                                        {date?.day}
                                    </Text>
                                </View>
                                {isToday && (
                                    <Text className="text-[10px] text-primary font-bold mt-0.5">
                                        Hoy
                                    </Text>
                                )}
                            </View>
                        )
                    }}
                    theme={{
                        calendarBackground: "transparent",
                        monthTextColor: "#111318",
                        textSectionTitleColor: "#94a3b8",
                        dayTextColor: "#111318",
                        todayTextColor: colors.primary,
                        arrowColor: colors.primary,
                        textMonthFontWeight: "700",
                    }}
                />
            </View>

            {/* ───── Legend ───── */}
            <View className="px-4 py-3">
                <View className="flex-row justify-around rounded-xl bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800">
                    <LegendDot color={colors.red} label="Periodo" />
                    <LegendDot color={colors.pink} label="Fértil" />
                    <LegendRing color={colors.purple} label="Ovulación" />
                </View>
            </View>

            {/* ───── Status Card ───── */}
            <View className="px-4 pt-2">
                <View className="flex-row gap-4 rounded-xl bg-white dark:bg-gray-900 p-5 border border-gray-100 dark:border-gray-800">
                    <View className="flex-1 gap-2">
                        <Text className="text-[11px] font-bold uppercase text-green-600">
                            Fase Lútea
                        </Text>
                        <Text className="text-lg font-bold dark:text-white">
                            Día 17 del ciclo
                        </Text>
                        <Text className="text-sm text-slate-500">
                            Probabilidad baja de embarazo. Tu próximo periodo se espera
                            en 11 días.
                        </Text>
                    </View>

                    <Image
                        source={{
                            uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuB39TL-FgtOjPCzNKS56wzfQQnWiH_sdoFfT2uoUWcQGR2Xat7reUAsX0mJ9fGS0nIIDtqnTbmSxWaUu-4GXsJrUUYikiE0xkeNMHs3tpTLFjp6S_EWB_vkPSKYxmqAV33ApRQ_vPlivaGB9SjmNWyYagSXO03_g_0SvqAMFWeduRJxvQEXAuJ7AMrhuPj10k1sQYQBTThrs1QLw61Iain14BPMAOmhTpbKb7CDqKxiKh_X9LktDFoPdJMMraAgtgc4lxkgRmyTY_Q",
                        }}
                        className="w-24 h-24 rounded-xl"
                    />
                </View>
            </View>

            {/* ───── FAB ───── */}
            <View className="px-5 py-4">
                <Pressable className="h-14 rounded-xl bg-primary items-center justify-center flex-row shadow-lg">
                    <Ionicons name="water" size={20} color="white" />
                    <Text className="ml-2 text-white font-bold">
                        Registrar Periodo
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

function LegendDot({ color, label }: any) {
    return (
        <View className="items-center gap-1">
            <View className="size-3 rounded-full" style={{ backgroundColor: color }} />
            <Text className="text-xs text-slate-500">{label}</Text>
        </View>
    )
}

function LegendRing({ color, label }: any) {
    return (
        <View className="items-center gap-1">
            <View
                className="size-3 rounded-full border-2"
                style={{ borderColor: color }}
            />
            <Text className="text-xs text-slate-500">{label}</Text>
        </View>
    )
}
