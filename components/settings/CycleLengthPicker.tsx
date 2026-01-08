import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import { WheelPicker } from './WheelPicker';

interface CycleLengthPickerProps {
  visible: boolean;
  onClose: () => void;
  onSave: (cycleLength: number, cycleType: 'regular' | 'irregular', cycleRangeMin?: number, cycleRangeMax?: number) => void;
  initialCycleLength: number;
  initialCycleType: 'regular' | 'irregular';
  initialCycleRangeMin?: number;
  initialCycleRangeMax?: number;
}

export function CycleLengthPicker({
  visible,
  onClose,
  onSave,
  initialCycleLength,
  initialCycleType,
  initialCycleRangeMin,
  initialCycleRangeMax,
}: CycleLengthPickerProps) {
  const [isRegularCycle, setIsRegularCycle] = useState(initialCycleType === 'regular');
  const [selectedCycleLength, setSelectedCycleLength] = useState(initialCycleLength);
  const [selectedMin, setSelectedMin] = useState(initialCycleRangeMin || 26);
  const [selectedMax, setSelectedMax] = useState(initialCycleRangeMax || 28);

  useEffect(() => {
    if (visible) {
      setIsRegularCycle(initialCycleType === 'regular');
      setSelectedCycleLength(initialCycleLength);
      setSelectedMin(initialCycleRangeMin || 26);
      setSelectedMax(initialCycleRangeMax || 28);
    }
  }, [visible, initialCycleType, initialCycleLength, initialCycleRangeMin, initialCycleRangeMax]);

  const handleSave = () => {
    if (isRegularCycle) {
      onSave(selectedCycleLength, 'regular');
    } else {
      const averageLength = Math.round((selectedMin + selectedMax) / 2);
      onSave(averageLength, 'irregular', selectedMin, selectedMax);
    }
    onClose();
  };

  const handleMinChange = (value: number) => {
    setSelectedMin(value);
    if (value >= selectedMax) {
      setSelectedMax(Math.min(value + 2, 31));
    }
  };

  const allDays = Array.from({ length: 31 }, (_, i) => i + 1);

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
              <Text className="text-xl font-bold text-text-primary mb-4">
                ¿Cuánto dura tu ciclo?
              </Text>
              <View className="flex-row gap-2 mb-2">
                <Pressable
                  onPress={() => setIsRegularCycle(true)}
                  className={`flex-1 py-2 px-4 rounded-full border ${isRegularCycle ? 'bg-primary border-primary' : 'bg-background border-gray-300'}`}
                >
                  <Text className={`text-center font-medium text-sm ${isRegularCycle ? 'text-white' : 'text-text-primary'}`}>
                    Regular
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setIsRegularCycle(false)}
                  className={`flex-1 py-2 px-4 rounded-full border ${!isRegularCycle ? 'bg-primary border-primary' : 'bg-background border-gray-300'}`}
                >
                  <Text className={`text-center font-medium text-sm ${!isRegularCycle ? 'text-white' : 'text-text-primary'}`}>
                    Irregular
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="py-4">
              {isRegularCycle ? (
                <WheelPicker
                  data={allDays}
                  selectedValue={selectedCycleLength}
                  onValueChange={setSelectedCycleLength}
                  width={200}
                  renderLabel={(value) => `${value} día${value > 1 ? 's' : ''}`}
                />
              ) : (
                <View className="flex-row justify-center">
                  <WheelPicker
                    data={allDays}
                    selectedValue={selectedMin}
                    onValueChange={handleMinChange}
                    width={100}
                    renderLabel={(value) => `${value}`}
                  />
                  <View className="justify-center px-2">
                    <Text className="text-2xl font-medium text-primary">-</Text>
                  </View>
                  <WheelPicker
                    data={allDays}
                    selectedValue={selectedMax}
                    onValueChange={setSelectedMax}
                    width={100}
                    renderLabel={(value) => `${value}`}
                  />
                </View>
              )}
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
