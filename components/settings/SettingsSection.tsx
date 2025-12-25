import { View, Text } from "react-native";

export function SettingsSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <View className="mt-6 ">
            <Text className="mb-3 px-2 text-lg font-bold text-text-primary">
                {title}
            </Text>

            <View className="overflow-hidden  rounded-[32px] border border-gray-200 bg-background shadow-md">
                {children}
            </View>
        </View>
    );
}
