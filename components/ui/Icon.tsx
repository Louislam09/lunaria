import { icons } from 'lucide-react-native'
import { styled } from 'nativewind'
import { memo, useMemo } from 'react'

type IconName = keyof typeof icons
type IconProps = { name: IconName; className?: string; size?: number }

const MyIcon: React.FC<IconProps> = memo(({ name, className, size }) => {
    const CustomIcon = useMemo(() => {
        const Icon = icons[name]
        Icon.displayName = name

        return styled(Icon, {
            className: "style",
        })
    }, [name])

    return <CustomIcon size={size} className={className} />
})

export default MyIcon