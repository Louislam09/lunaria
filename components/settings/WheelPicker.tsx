import React from 'react';
import WheelPickerBase, {
    type PickerItem,
} from '@quidone/react-native-wheel-picker';
import { View } from 'react-native';
import { colors } from '@/utils/colors';

const ITEM_HEIGHT = 48;


interface WheelPickerProps {
    data: number[];
    selectedValue: number;
    onValueChange: (value: number) => void;
    width?: number;
    renderLabel?: (value: number) => string;
}

export function WheelPicker({
    data,
    selectedValue,
    onValueChange,
    width = 150,
    renderLabel,
}: WheelPickerProps) {
    const pickerData: PickerItem<number>[] = data.map((value) => ({
        value,
        label: renderLabel ? renderLabel(value) : `${value} día${value > 1 ? 's' : ''}`,
    }));

    return (
        <View className="items-center">
            <WheelPickerBase
                data={pickerData}
                value={selectedValue}
                onValueChanged={({ item }) => onValueChange(item.value)}
                width={width}
                itemHeight={ITEM_HEIGHT}
                enableScrollByTapOnItem={true}
                itemTextStyle={{
                    fontSize: 20,
                    fontWeight: '500',
                    color: colors.textPrimary,
                }}
                overlayItemStyle={{
                    backgroundColor: colors.lavender + 80,
                    borderRadius: 0,
                    opacity: 0.3,
                    borderWidth: 2,
                    borderColor: colors.lavender,
                    borderLeftWidth: 0,
                    borderRightWidth: 0,
                }}
            />
        </View>
    );
}

export { ITEM_HEIGHT };
