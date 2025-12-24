import { Text, View } from "react-native";
import MyIcon from "./Icon";
import { icons } from "lucide-react-native";
import { useCallback } from "react";

interface CardProps {
    icon: {
        name: keyof typeof icons;
        size?: number;
        className?: string;
    }
    title: string;
    children: React.ReactNode;
}
function Card({ icon, title, children }: CardProps) {
    const extraIconBg = useCallback(() => {
        const color = icon.className?.split("-")[1];
        return color === 'primary' ? "bg-primary/10" : `bg-${color}-100`;
    }, [icon.className])

    return (
        <View className="mt-5 p-5 rounded-3xl bg-white shadow-md border border-gray-200">
            <View className="flex-row items-center gap-3 mb-3">
                <View className={`w-10 h-10 rounded-full ${extraIconBg()} items-center justify-center`}>
                    <MyIcon name={icon.name} size={icon.size} className={icon.className} />
                </View>
                <Text className="font-bold text-text-primary text-base">
                    {title}
                </Text>
            </View>
            {children}
        </View>
    )
}

export default Card;