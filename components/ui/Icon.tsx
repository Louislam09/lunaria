import { icons } from 'lucide-react-native'
import { styled } from 'nativewind'
import { memo, useMemo } from 'react'
import { StyleProp, TextStyle } from 'react-native'

type IconName = keyof typeof icons
type IconProps = { name: IconName; className?: string; size?: number; style?: StyleProp<TextStyle>; color?: string }

const MyIcon: React.FC<IconProps> = memo(({ name, className, size, style, color }) => {
    const CustomIcon = useMemo(() => {
        const Icon = icons[name]
        if (!Icon) {
            console.warn(`Icon "${name}" not found in lucide-react-native. Using "HelpCircle" as fallback.`)
            const FallbackIcon = icons['HelpCircle'] || icons['Circle']
            if (FallbackIcon) {
                FallbackIcon.displayName = name
                return styled(FallbackIcon, {
                    className: "style",
                })
            }
            return null
        }
        Icon.displayName = name

        return styled(Icon, {
            className: "style",
        })
    }, [name])

    if (!CustomIcon) {
        return null
    }

    return <CustomIcon size={size} className={className} color={color} />
})

export default MyIcon