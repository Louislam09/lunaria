import { colors } from "@/utils/colors";
import { Icon, icons } from "lucide-react-native";
import { Switch, Text, View } from "react-native";
import MyIcon from "../ui/Icon";
import * as Haptics from "expo-haptics";

type ToggleRowProps = {
    icon: keyof typeof icons;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle?: string;
    value: boolean;
    showDivider?: boolean;
    onChange: (value: boolean) => void;
}

export function ToggleRow({
    icon,
    iconBg,
    iconColor,
    title,
    subtitle,
    value,
    showDivider = true,
    onChange,
}: ToggleRowProps) {
    // use expo-haptics
    const handleChange = (value: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(value);
    };
    return (
        <View className="px-5 py-4">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-4">
                    <View
                        className={`h-10 w-10 items-center justify-center rounded-full ${iconBg}`}
                    >
                        <MyIcon name={icon} className={iconColor} />
                    </View>

                    <View>
                        <Text className="text-sm font-bold text-text-primary">
                            {title}
                        </Text>
                        <Text className="text-xs font-medium text-text-muted">
                            {subtitle}
                        </Text>
                    </View>
                </View>

                <Switch value={value} onChange={({ nativeEvent: { value } }) => handleChange(value)} thumbColor={colors.moonWhite} trackColor={{ true: colors.lavender, false: colors.textPrimary }} />
            </View>

            {showDivider && (
                <View className="mt-4 h-px bg-gray-200" />
            )}
        </View>
    );
}
