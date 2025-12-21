import { useEffect } from "react"
import Svg, { Circle } from "react-native-svg"
import Animated, {
    useSharedValue,
    useAnimatedProps,
    withTiming,
    Easing,
} from "react-native-reanimated"

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

type CircularProgressProps = {
    value: number // 0–100
    size?: number
    strokeWidth?: number
    color?: string
    backgroundColor?: string
    duration?: number
}

export function CircularProgress({
    value,
    size = 180,
    strokeWidth = 8,
    color = "#8b5cf6",
    backgroundColor = "#e5e7eb",
    duration = 900,
}: CircularProgressProps) {
    const radius = (100 - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    const progress = useSharedValue(0)

    useEffect(() => {
        progress.value = withTiming(value, {
            duration,
            easing: Easing.out(Easing.cubic),
        })
    }, [value])

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset:
            circumference - (circumference * progress.value) / 100,
    }))

    return (
        <Svg width={size} height={size} viewBox="0 0 100 100">
            {/* Background */}
            <Circle
                cx="50"
                cy="50"
                r={radius}
                stroke={backgroundColor}
                strokeWidth={strokeWidth}
                fill="none"
            />

            {/* Progress */}
            <AnimatedCircle
                cx="50"
                cy="50"
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                animatedProps={animatedProps}
                strokeLinecap="round"
                fill="none"
                rotation="-90"
                origin="50,50"
            />
        </Svg>
    )
}
