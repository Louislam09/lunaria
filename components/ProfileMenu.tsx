import { useRouter } from "expo-router"
import {
    icons
} from "lucide-react-native"
import { Text, TouchableOpacity, View } from "react-native"
import { MyImage } from "./ui"
import MyIcon from "./ui/Icon"
import { useAuth } from "@/context/AuthContext"
import { useOnboarding } from "@/context/OnboardingContext"
import { getAvatarSource } from "@/utils/avatar"

type Action = {
    icon: keyof typeof icons;
    title: string;
    onPress: () => void;
    bgColor: string;
    iconColor: string;
}

interface ProfileMenuProps {
    onMenuClose: () => void;
}

export function ProfileMenu({ onMenuClose }: ProfileMenuProps) {
    const { user, logout } = useAuth();
    const { data } = useOnboarding();
    const { name } = data;
    const router = useRouter()
    const handleLogout = async () => {
        await logout()
        console.log('Logout')
        router.replace('/splash')
        onMenuClose()
    }

    const onViewProfile = () => {
        console.log('View profile')
        router.push('/profile')
        onMenuClose()
    }

    const onSettings = () => {
        console.log('Settings')
        router.push('/settings')
        onMenuClose()
    }

    const actions: Action[] = [
        {
            icon: "User",
            title: "Ver perfil",
            onPress: onViewProfile,
            bgColor: "bg-purple-100",
            iconColor: "text-purple-600"
        },
        {
            icon: "Settings",
            title: "Ajustes",
            onPress: onSettings,
            bgColor: "bg-gray-200",
            iconColor: "text-gray-500"
        },
    ]

    return (
        <View className="w-72 rounded-3xl shadow-xl border border-gray-100 px-2 pb-3 overflow-hidden">
            {/* User header */}
            <View className="flex-row items-center gap-4 p-5 border-b border-gray-100">
                <MyImage
                    source={getAvatarSource(data.avatarUrl)}
                    contentFit="contain"
                    className="h-12 w-12 rounded-full"
                />

                <View className="flex-1">
                    <Text className="text-base font-bold text-text-primary">
                        {name}
                    </Text>
                    <Text className="text-xs text-text-muted mt-0.5">
                        {user?.email || 'usuario@email.com'}
                    </Text>
                </View>
            </View>

            {/* Actions */}
            <View className="flex flex-col gap-2">
                {/* View profile */}
                {actions.map((actions, index) => (
                    <TouchableOpacity key={index} onPress={actions.onPress} className="flex-row items-center justify-between p-3 rounded-3xl bg-gray-50 active:scale-[0.98]">
                        <View className="flex-row items-center gap-3">
                            <View className={`h-10 w-10 rounded-full ${actions.bgColor} items-center justify-center`}>
                                <MyIcon name={actions.icon} size={20} className={actions.iconColor} />
                            </View>
                            <Text className="text-base font-semibold text-text-primary">
                                {actions.title}
                            </Text>
                        </View>

                        <MyIcon name="ChevronRight" size={20} className="text-gray-400" />
                    </TouchableOpacity>

                ))}
            </View>

            {/* Logout */}
            <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center p-3 rounded-2xl bg-background active:scale-[0.98]">
                <View className="flex-row items-center gap-3">
                    <MyIcon name="LogOut" size={20} className="text-red-500" />
                    <Text className="text-base font-semibold text-red-500">
                        Cerrar sesión
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}
