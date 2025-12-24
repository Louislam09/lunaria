import { colors } from "@/utils/colors";
import React from "react";
import { View } from "react-native";
import Popover from "react-native-popover-view";

interface ITooltip {
    target: any;
    isVisible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    offset?: number;
}

const Tooltip = ({
    target,
    offset,
    isVisible,
    onClose,
    children,
}: ITooltip) => {

    return (
        <Popover
            offset={offset || 30}
            from={target}
            isVisible={isVisible}
            onRequestClose={onClose}
            popoverStyle={{ backgroundColor: colors.moonWhite, borderRadius: 10, padding: 0 }}
        >
            <View className="bg-background rounded-3xl shadow-xl border border-gray-100 overflow-hidden">{children}</View>
        </Popover>
    );
};

export default Tooltip;
