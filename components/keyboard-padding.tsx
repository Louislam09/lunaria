import Animated, {
    useAnimatedKeyboard,
    useAnimatedStyle,
} from "react-native-reanimated";

export const KeyboardPaddingView = () => {
    const { height } = useAnimatedKeyboard();

    const keyboardHeightStyle = useAnimatedStyle(() => {
        return {
            height: Math.max(height.get(), 0),
        };
    });
    return <Animated.View style={keyboardHeightStyle} />;
}
