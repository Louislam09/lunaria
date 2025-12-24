import Card from "@/components/ui/Card"
import MyIcon from "@/components/ui/Icon"
import { ContraceptiveMethod, useOnboarding } from "@/context/OnboardingContext"
import { router } from "expo-router"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"

type MethodData = {
    name: string
    description: string
    icon: string
    iconBg: string
    tags: Array<{ label: string; color: 'green' | 'blue' | 'orange' }>
    effectiveness: {
        perfect: number
        typical: number
        percentage: number
    }
    howItWorks: string
    sideEffects: string[]
}

const METHOD_DATA: Record<ContraceptiveMethod, MethodData> = {
    none: {
        name: "Ninguno",
        description: "No estás usando ningún método anticonceptivo",
        icon: "🚫",
        iconBg: "bg-gray-100",
        tags: [
            { label: "Natural", color: "orange" }
        ],
        effectiveness: {
            perfect: 0,
            typical: 0,
            percentage: 0
        },
        howItWorks: "Sin método anticonceptivo, el riesgo de embarazo depende del ciclo menstrual y la ventana fértil.",
        sideEffects: []
    },
    condom: {
        name: "Condón",
        description: "Método de barrera",
        icon: "🛡️",
        iconBg: "bg-blue-100",
        tags: [
            { label: "Alta eficacia", color: "green" },
            { label: "Barrera", color: "blue" }
        ],
        effectiveness: {
            perfect: 98,
            typical: 87,
            percentage: 92
        },
        howItWorks: "Crea una barrera física que impide que los espermatozoides entren en el útero. También protege contra enfermedades de transmisión sexual.",
        sideEffects: [
            "Irritación en algunos casos",
            "Posible alergia al látex (si es de látex)"
        ]
    },
    pill: {
        name: "Píldora",
        description: "Anticonceptivo oral combinado",
        icon: "💊",
        iconBg: "bg-primary/10",
        tags: [
            { label: "Alta eficacia", color: "green" },
            { label: "Hormonal", color: "blue" }
        ],
        effectiveness: {
            perfect: 99,
            typical: 91,
            percentage: 95
        },
        howItWorks: "Libera hormonas que impiden la ovulación y espesan el moco cervical, dificultando el paso de los espermatozoides.",
        sideEffects: [
            "Náuseas leves",
            "Sensibilidad en los senos",
            "Manchados",
            "Cambios de humor"
        ]
    },
    injection: {
        name: "Inyección",
        description: "Anticonceptivo inyectable",
        icon: "💉",
        iconBg: "bg-purple-100",
        tags: [
            { label: "Alta eficacia", color: "green" },
            { label: "Hormonal", color: "blue" }
        ],
        effectiveness: {
            perfect: 99,
            typical: 94,
            percentage: 96
        },
        howItWorks: "Inyección de progestina que previene la ovulación y espesa el moco cervical. Se administra cada 3 meses.",
        sideEffects: [
            "Cambios en el ciclo menstrual",
            "Aumento de peso",
            "Dolores de cabeza",
            "Cambios de humor"
        ]
    },
    implant: {
        name: "Implante",
        description: "Implante subdérmico",
        icon: "📏",
        iconBg: "bg-pink-100",
        tags: [
            { label: "Muy alta eficacia", color: "green" },
            { label: "Hormonal", color: "blue" }
        ],
        effectiveness: {
            perfect: 99,
            typical: 99,
            percentage: 99
        },
        howItWorks: "Pequeño implante que libera progestina de forma continua durante 3 años. Previene la ovulación y espesa el moco cervical.",
        sideEffects: [
            "Cambios en el sangrado menstrual",
            "Dolores de cabeza",
            "Aumento de peso",
            "Cambios de humor"
        ]
    },
    iud_hormonal: {
        name: "DIU Hormonal",
        description: "Dispositivo intrauterino hormonal",
        icon: "⚓",
        iconBg: "bg-teal-100",
        tags: [
            { label: "Muy alta eficacia", color: "green" },
            { label: "Hormonal", color: "blue" }
        ],
        effectiveness: {
            perfect: 99,
            typical: 99,
            percentage: 99
        },
        howItWorks: "Dispositivo pequeño insertado en el útero que libera progestina. Previene la ovulación y espesa el moco cervical. Dura hasta 5 años.",
        sideEffects: [
            "Cambios en el sangrado menstrual",
            "Cólicos leves",
            "Manchados irregulares",
            "Dolores de cabeza"
        ]
    },
    iud_copper: {
        name: "DIU de Cobre",
        description: "Dispositivo intrauterino de cobre",
        icon: "⚓",
        iconBg: "bg-orange-100",
        tags: [
            { label: "Muy alta eficacia", color: "green" },
            { label: "No hormonal", color: "blue" }
        ],
        effectiveness: {
            perfect: 99,
            typical: 99,
            percentage: 99
        },
        howItWorks: "Dispositivo de cobre insertado en el útero que crea un ambiente hostil para los espermatozoides. No contiene hormonas y puede durar hasta 10 años.",
        sideEffects: [
            "Sangrado más abundante",
            "Cólicos más intensos",
            "Dolor durante la inserción"
        ]
    },
    other: {
        name: "Otro método",
        description: "Método anticonceptivo personalizado",
        icon: "➕",
        iconBg: "bg-gray-100",
        tags: [
            { label: "Personalizado", color: "orange" }
        ],
        effectiveness: {
            perfect: 0,
            typical: 0,
            percentage: 0
        },
        howItWorks: "Consulta con tu especialista para obtener información específica sobre tu método anticonceptivo.",
        sideEffects: []
    }
}

function Tag({ label, color }: { label: string; color: 'green' | 'blue' | 'orange' }) {
    const colors = {
        green: "bg-green-100 text-green-700",
        blue: "bg-blue-100 text-blue-700",
        orange: "bg-orange-100 text-orange-700",
    }

    const textColor = {
        green: "text-green-700",
        blue: "text-blue-700",
        orange: "text-orange-700",
    }

    return (
        <View className={`px-3 py-1 rounded-full ${colors[color]}`}>
            <Text className={`text-sm font-semibold ${textColor[color]}`}>{label}</Text>
        </View>
    )
}

export default function MethodDetailScreen() {
    const { data } = useOnboarding()
    const method = (data.contraceptiveMethod || 'none') as ContraceptiveMethod
    const methodData = METHOD_DATA[method]
    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="absolute top-0 left-0 right-0 z-20 flex-row items-center justify-between px-6 pt-6 pb-2 bg-background/90 backdrop-blur-sm">
                <Text className="text-2xl font-bold text-text-primary">
                    Tu Método
                </Text>

                <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-background">
                    <MyIcon name="EllipsisVertical" className="text-text-primary" />
                </TouchableOpacity>
            </View>

            <ScrollView className="px-4" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View className="h-24" />
                {/* Hero Card */}
                <View className="items-center p-6 rounded-3xl bg-white shadow-md border border-gray-200">
                    <View className={`w-20 h-20 rounded-full ${methodData.iconBg} items-center justify-center mb-4`}>
                        <Text className="text-4xl">{methodData.icon}</Text>
                    </View>

                    <Text className="text-2xl font-bold text-text-primary">
                        {methodData.name}
                    </Text>
                    <Text className="text-sm text-text-muted mt-1">
                        {methodData.description}
                    </Text>

                    {methodData.tags.length > 0 && (
                        <View className="flex-row gap-2 mt-4 flex-wrap justify-center">
                            {methodData.tags.map((tag, index) => (
                                <Tag key={index} label={tag.label} color={tag.color} />
                            ))}
                        </View>
                    )}
                </View>

                {/* Effectiveness */}
                {methodData.effectiveness.percentage > 0 && (
                    <Card
                        icon={{ name: "ShieldCheck", size: 20, className: "text-primary" }}
                        title="Efectividad"
                    >
                        <View className="flex-row items-end gap-2 mb-2">
                            <Text className="text-3xl font-bold text-primary">
                                {methodData.effectiveness.typical} – {methodData.effectiveness.perfect}%
                            </Text>
                            <Text className="text-sm text-text-primary">protección</Text>
                        </View>

                        <View className="w-full h-2 bg-gray-200 rounded-full mb-3">
                            <View
                                className={`h-2 bg-primary rounded-full w-[${methodData.effectiveness.percentage}%]`}
                            />
                        </View>

                        <Text className="text-xs text-text-primary">
                            <Text className="font-bold text-text-primary">{methodData.effectiveness.perfect}%</Text>{" "}
                            uso perfecto{"\n"}
                            <Text className="font-bold text-text-primary">{methodData.effectiveness.typical}%</Text>{" "}
                            uso típico
                        </Text>
                    </Card>
                )}

                {/* How it works */}
                <Card
                    icon={{ name: "Brain", size: 20, className: "text-purple-500" }}
                    title="¿Cómo funciona?"
                >
                    <Text className="text-sm text-text-primary leading-relaxed">
                        {methodData.howItWorks}
                    </Text>
                </Card>

                {/* Side effects */}
                {methodData.sideEffects.length > 0 && (
                    <Card
                        icon={{ name: "TriangleAlert", size: 20, className: "text-orange-500" }}
                        title="Efectos secundarios"
                    >
                        {methodData.sideEffects.map((item, index) => (
                            <View key={index} className="flex-row items-center gap-2 mb-2">
                                <View className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                                <Text className="text-sm text-text-primary">{item}</Text>
                            </View>
                        ))}
                    </Card>
                )}

                {/* Action */}
                <TouchableOpacity
                    onPress={() => router.push('/edit-method')}
                    activeOpacity={0.6}
                    className="w-full mt-5 bg-primary py-5 rounded-full items-center justify-center flex-row gap-2"
                >
                    <MyIcon name="RefreshCcw" size={20} className="text-white " />
                    <Text className="text-white font-bold text-base">
                        {method === 'none' ? 'Seleccionar método anticonceptivo' : 'Cambiar método anticonceptivo'}
                    </Text>
                </TouchableOpacity>
                {method !== 'none' && (
                    <Text className="text-xs text-center text-text-muted mt-3 px-6">
                        Consulta siempre con un especialista antes de cambiar tu método.
                    </Text>
                )}
            </ScrollView>
        </View>
    )
}
