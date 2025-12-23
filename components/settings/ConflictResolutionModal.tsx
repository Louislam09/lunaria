import React from 'react';
import { Modal, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import MyIcon from '../ui/Icon';
import { Conflict } from '@/services/conflictResolution';

interface ConflictResolutionModalProps {
  visible: boolean;
  conflicts: Conflict[];
  onResolve: (conflict: Conflict, keepLocal: boolean) => Promise<void>;
  onClose: () => void;
}

export function ConflictResolutionModal({
  visible,
  conflicts,
  onResolve,
  onClose,
}: ConflictResolutionModalProps) {
  if (conflicts.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          <View className="px-6 py-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-text-primary">
                Resolver Conflictos ({conflicts.length})
              </Text>
              <TouchableOpacity onPress={onClose}>
                <MyIcon name="X" size={24} className="text-text-primary" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-text-muted mt-2">
              Se detectaron conflictos entre datos locales y remotos. Los datos locales tienen prioridad.
            </Text>
          </View>

          <ScrollView className="flex-1 px-6 py-4">
            {conflicts.map((conflict, index) => (
              <View
                key={conflict.id}
                className="mb-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200"
              >
                <Text className="text-sm font-bold text-yellow-800 mb-2">
                  {conflict.table === 'daily_logs' ? 'Registro Diario' : conflict.table}
                </Text>
                <Text className="text-xs text-yellow-700 mb-3">
                  Fecha local: {conflict.localUpdated.toLocaleString()}
                  {'\n'}
                  Fecha remota: {conflict.remoteUpdated.toLocaleString()}
                </Text>

                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => onResolve(conflict, true)}
                    className="flex-1 bg-primary py-3 rounded-lg items-center"
                  >
                    <Text className="text-white font-bold text-sm">
                      Mantener Local
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onResolve(conflict, false)}
                    className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
                  >
                    <Text className="text-gray-700 font-bold text-sm">
                      Usar Remoto
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View className="px-6 py-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={async () => {
                // Resolve all with local preference
                for (const conflict of conflicts) {
                  await onResolve(conflict, true);
                }
                onClose();
              }}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold text-base">
                Resolver Todos (Mantener Local)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

