import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { WheelPicker } from './WheelPicker';

interface PeriodLengthPickerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (periodLength: number) => void;
  initialPeriodLength: number;
}

export function PeriodLengthPicker({
  visible,
  onClose,
  onSave,
  initialPeriodLength,
}: PeriodLengthPickerProps) {
  const [selectedPeriodLength, setSelectedPeriodLength] = useState(initialPeriodLength);

  useEffect(() => {
    if (visible) {
      setSelectedPeriodLength(initialPeriodLength);
    }
  }, [visible, initialPeriodLength]);

  const handleSave = () => {
    onSave(selectedPeriodLength);
    onClose();
  };

  const allDays = Array.from({ length: 15 }, (_, i) => i + 1); // 1-15 days for period

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-gray-500/60"
        onPress={onClose}
      >
        <View className="flex-1" />
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-background rounded-t-3xl border-2 border-gray-300">
            <View className="px-6 pt-6 pb-4">
              <Text className="text-xl font-bold text-text-primary mb-2">
                ¿Cuánto dura tu periodo?
              </Text>
            </View>

            <View className="py-4">
              <WheelPicker
                data={allDays}
                selectedValue={selectedPeriodLength}
                onValueChange={setSelectedPeriodLength}
                width={200}
                renderLabel={(value) => `${value} día${value > 1 ? 's' : ''}`}
              />
            </View>

            <View className="px-6 pt-4 pb-6">
              <TouchableOpacity
                onPress={handleSave}
                className="w-full py-4 bg-primary rounded-full"
              >
                <Text className="text-center font-bold text-white text-base">
                  Continuar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
