import { icons } from 'lucide-react-native'
import { styled } from 'nativewind'
import { memo, useMemo } from 'react'
import { StyleProp, TextStyle } from 'react-native'

type IconName = keyof typeof icons
type IconProps = { name: IconName; className?: string; size?: number; style?: StyleProp<TextStyle>; color?: string }

const MyIcon: React.FC<IconProps> = memo(({ name, className, size, style, color }) => {
    const CustomIcon = useMemo(() => {
        const Icon = icons[name]
        Icon.displayName = name

        return styled(Icon, {
            className: "style",
        })
    }, [name])

    return <CustomIcon size={size} className={className} color={color} />
})

export default MyIcon