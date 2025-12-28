import { colors } from "@/utils/colors";
import { Pencil } from "lucide-react-native";
import { View, Text, Image, TouchableOpacity, ImageSourcePropType } from "react-native";
import MyIcon from "../ui/Icon";
import { getAvatarSource } from "@/utils/avatar";

type ProfileCardProps = {
    name: string;
    email: string;
    avatarUrl?: string;
    isPremium?: boolean;
    onEditPress?: () => void;
};

export function ProfileCard({
    name,
    email,
    avatarUrl,
    isPremium = false,
    onEditPress,
}: ProfileCardProps) {
    const avatarSource: ImageSourcePropType = getAvatarSource(avatarUrl);

    return (
        <View className="mt-4 px-4">
            <View className="relative overflow-hidden rounded-[40px] bg-background p-6 border border-gray-100 shadow-md">
                {/* Decorative blurred circle */}
                <View className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/40 blur-2xl" />

                <View className="items-center text-center">
                    {/* Avatar */}
                    <View className="relative mb-4">
                        <Image
                            source={avatarSource}
                            className="h-28 w-28 rounded-full border-4 border-white"
                            defaultSource={require("@/assets/images/avatar.jpg")}
                        />

                        <TouchableOpacity
                            onPress={onEditPress}
                            activeOpacity={0.8}
                            className="absolute bottom-1 right-1 h-8 w-8 items-center justify-center rounded-full bg-primary border-2 border-white"
                        >
                            <MyIcon name="Pencil" size={16} className="text-text-primary fill-white" />
                        </TouchableOpacity>
                    </View>

                    {/* Name */}
                    <Text className="text-2xl font-bold text-text-primary">
                        {name}
                    </Text>

                    {/* Email */}
                    <Text className="mt-1 text-base font-medium text-text-muted">
                        {email}
                    </Text>

                    {/* Badge */}
                    {isPremium && (
                        <View className="mt-4 rounded-full bg-primary/10 px-4 py-1.5">
                            <Text className="text-xs font-bold uppercase tracking-wide text-primary">
                                Premium
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}
