import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white">
      <View className="p-4" style={{ paddingTop: insets.top + 16 }}>
        <Text className="text-2xl font-bold">Ajustes</Text>
      </View>
      <ScrollView className="flex-1 px-4">
        <Text className="text-gray-600">Configuración de la aplicación</Text>
      </ScrollView>
    </View>
  );
}

