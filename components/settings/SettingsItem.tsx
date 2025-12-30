import { colors } from "@/utils/colors";
import { ChevronRight, icons } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";
import MyIcon from "../ui/Icon";

type SettingsItemProps = {
    icon: keyof typeof icons;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle?: string;
    showDivider?: boolean;
    showChevron?: boolean;
    onPress?: () => void;
    disabled?: boolean;
}

export function SettingsItem({
    icon,
    iconBg,
    iconColor,
    title,
    subtitle,
    showDivider = true,
    showChevron = true,
    onPress,
    disabled = false,
}: SettingsItemProps) {
    return (
        <TouchableOpacity 
            className={`flex-row items-center justify-between px-5 py-4 ${disabled ? 'opacity-50' : ''}`} 
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
        >
            <View className="flex-row items-center gap-4  flex-1">
                <View
                    className={`h-10 w-10 items-center justify-center rounded-full ${iconBg}`}
                >
                    <MyIcon name={icon} className={iconColor} />
                </View>

                <View className="flex-1">
                    <Text className="text-sm font-bold text-text-primary">
                        {title}
                    </Text>
                    {subtitle && (
                        <Text className="text-xs font-medium text-text-muted">
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>
            {showChevron && (
                <ChevronRight size={22} color={colors.textPrimary} />
            )}

            {showDivider && (
                <View className="absolute bottom-0 left-5 right-5 h-px bg-gray-200" />
            )}
        </TouchableOpacity>
    );
}
