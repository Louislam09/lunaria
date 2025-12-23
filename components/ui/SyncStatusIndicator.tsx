import React from 'react';
import { Pressable, Text, View } from 'react-native';
import MyIcon from './Icon';
import { useSync } from '@/context/SyncContext';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

export function SyncStatusIndicator({ showLabel = false }: { showLabel?: boolean }) {
  const { pendingItems, isSyncing, lastSyncTime, sync } = useSync();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const getStatusColor = () => {
    if (isSyncing) return 'text-blue-500';
    if (pendingItems > 0) return 'text-yellow-500';
    if (lastSyncTime) {
      const hoursSinceSync = (Date.now() - lastSyncTime.getTime()) / (1000 * 60 * 60);
      if (hoursSinceSync > 48) return 'text-red-500';
      if (hoursSinceSync > 24) return 'text-yellow-500';
    }
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (isSyncing) return 'Loader';
    if (pendingItems > 0) return 'CloudOff';
    return 'CloudCheck';
  };

  const handlePress = () => {
    if (pendingItems > 0 || !lastSyncTime) {
      router.push('/(tabs)/settings');
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center gap-2"
    >
      <View className={`relative ${isSyncing ? 'animate-spin' : ''}`}>
        <MyIcon
          name={getStatusIcon() as any}
          size={20}
          className={getStatusColor()}
        />
        {pendingItems > 0 && !isSyncing && (
          <View className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-500 border border-white" />
        )}
      </View>
      {showLabel && (
        <Text className={`text-xs font-medium ${getStatusColor()}`}>
          {isSyncing
            ? 'Sincronizando...'
            : pendingItems > 0
            ? `${pendingItems} pendiente${pendingItems > 1 ? 's' : ''}`
            : 'Sincronizado'}
        </Text>
      )}
    </Pressable>
  );
}

