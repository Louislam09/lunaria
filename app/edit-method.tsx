import MyIcon from "@/components/ui/Icon"
import { ContraceptiveMethod, useOnboarding } from "@/context/OnboardingContext"
import { router, Stack } from "expo-router"
import { useState } from "react"
import { Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const contraceptiveMethods: { id: ContraceptiveMethod; label: string; icon: string }[] = [
    { id: 'none', label: 'Ninguno', icon: '🚫' },
    { id: 'condom', label: 'Condón', icon: '🛡️' },
    { id: 'pill', label: 'Pastillas anticonceptivas', icon: '💊' },
    { id: 'injection', label: 'Inyección', icon: '💉' },
    { id: 'implant', label: 'Implante', icon: '📏' },
    { id: 'iud_hormonal', label: 'DIU hormonal', icon: '⚓' },
    { id: 'iud_copper', label: 'DIU de cobre', icon: '⚓' },
]

export default function EditMethodScreen() {
    const insets = useSafeAreaInsets()
    const { data, updateData } = useOnboarding()
    const [selectedMethod, setSelectedMethod] = useState<ContraceptiveMethod>(
        (data.contraceptiveMethod || 'none') as ContraceptiveMethod
    )

    const handleSave = () => {
        updateData({ contraceptiveMethod: selectedMethod })
        router.back()
    }

    return (
        <View className="flex-1 bg-background relative">
            <Stack.Screen
                options={{
                    headerShown: false,
                    animation: 'slide_from_right',
                    presentation: 'pageSheet'
                }}
            />

            {/* Header */}
            <View className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
                <View className="flex-row items-center justify-between w-full">

                    <Text className="text-2xl font-bold text-text-primary">
                        Editar Método
                    </Text>

                    <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-background">
                        <MyIcon name="X" className="text-text-primary" />
                    </TouchableOpacity>
                </View>
                <Text className="text-base text-text-primary ">
                    Selecciona el método que estás utilizando actualmente:
                </Text>
            </View>

            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ paddingBottom: 200 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="h-34" />
                {/* Instructional text */}


                {/* Methods list */}
                <View className="gap-3">
                    {contraceptiveMethods.map((method) => {
                        const isSelected = selectedMethod === method.id
                        return (
                            <Pressable
                                key={method.id}
                                onPress={() => setSelectedMethod(method.id)}
                                className={`flex-row items-center p-4 rounded-2xl border-2 ${isSelected
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-200 bg-white'
                                    }`}
                            >
                                {/* Icon */}
                                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isSelected ? 'bg-primary' : 'bg-gray-200'
                                    }`}>
                                    <Text className="text-2xl">{method.icon}</Text>
                                </View>

                                {/* Label */}
                                <Text className={`flex-1 text-base font-medium ${isSelected ? 'text-text-primary' : 'text-text-primary'
                                    }`}>
                                    {method.label}
                                </Text>

                                {/* Radio button */}
                                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected
                                    ? 'border-primary bg-primary'
                                    : 'border-gray-300 bg-transparent'
                                    }`}>
                                    {isSelected && (
                                        <View className="w-3 h-3 rounded-full bg-white" />
                                    )}
                                </View>
                            </Pressable>
                        )
                    })}
                </View>
            </ScrollView>
            {/* Save button */}
            <View className="absolute bottom-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
                <TouchableOpacity
                    onPress={handleSave}
                    activeOpacity={0.8}
                    className="w-full bg-primary py-4 rounded-full items-center justify-center"
                >
                    <Text className="text-white font-bold text-base">
                        Guardar cambios
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

