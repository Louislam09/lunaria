import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/utils/colors';

interface TimePickerProps {
  value: string; // HH:mm format
  onChange: (time: string) => void;
  disabled?: boolean;
}

export function TimePicker({ value, onChange, disabled = false }: TimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Parse HH:mm string to Date
  const parseTime = (timeStr: string): Date => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hour || 9, minute || 0, 0, 0);
    return date;
  };

  // Format Date to HH:mm string
  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange(formatTime(selectedDate));
    }
  };

  const displayTime = value || '09:00';

  return (
    <View>
      <TouchableOpacity
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
        className={`px-4 py-2 rounded-xl border ${
          disabled ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-300'
        }`}
      >
        <Text className={`text-sm font-semibold ${disabled ? 'text-gray-400' : 'text-text-primary'}`}>
          {displayTime}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={parseTime(value)}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          textColor={colors.textPrimary}
        />
      )}
    </View>
  );
}

