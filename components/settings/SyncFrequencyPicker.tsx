import React from "react";
import { colors } from "@/utils/colors";
import { Text, TouchableOpacity, View } from "react-native";
import MyIcon from "../ui/Icon";
import { SyncFrequency } from "@/services/syncService";

type SyncFrequencyPickerProps = {
  value: SyncFrequency;
  onChange: (value: SyncFrequency) => void;
  showDivider?: boolean;
};

const frequencyOptions: Array<{ value: SyncFrequency; label: string; description: string }> = [
  { value: 'daily', label: 'Diario', description: 'Sincroniza todos los días' },
  { value: 'weekly', label: 'Semanal', description: 'Sincroniza una vez por semana' },
  { value: 'monthly', label: 'Mensual', description: 'Sincroniza una vez al mes' },
];

export function SyncFrequencyPicker({ value, onChange, showDivider = true }: SyncFrequencyPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const currentOption = frequencyOptions.find(opt => opt.value === value);

  return (
    <View>
      <TouchableOpacity
        className="flex-row items-center justify-between px-5 py-4"
        onPress={() => setIsOpen(!isOpen)}
      >
        <View className="flex-row items-center gap-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <MyIcon name="RefreshCw" className="text-green-500" />
          </View>

          <View className="flex-1">
            <Text className="text-sm font-bold text-text-primary">
              Frecuencia de Sincronización
            </Text>
            <Text className="text-xs font-medium text-text-muted">
              {currentOption?.label} - {currentOption?.description}
            </Text>
          </View>
        </View>

        <MyIcon
          name={isOpen ? "ChevronUp" : "ChevronDown"}
          size={22}
          className="text-text-primary"
        />

        {showDivider && (
          <View className="absolute bottom-0 left-5 right-5 h-px bg-gray-200" />
        )}
      </TouchableOpacity>

      {isOpen && (
        <View className="px-5 pb-4 bg-gray-50">
          {frequencyOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              className={`flex-row items-center gap-3 px-4 py-3 rounded-xl mb-2 ${
                value === option.value ? 'bg-primary/10 border border-primary' : 'bg-white'
              }`}
              onPress={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <View
                className={`h-5 w-5 rounded-full border-2 items-center justify-center ${
                  value === option.value
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}
              >
                {value === option.value && (
                  <View className="h-2 w-2 rounded-full bg-white" />
                )}
              </View>
              <View className="flex-1">
                <Text
                  className={`text-sm font-bold ${
                    value === option.value ? 'text-primary' : 'text-text-primary'
                  }`}
                >
                  {option.label}
                </Text>
                <Text className="text-xs text-text-muted">{option.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

