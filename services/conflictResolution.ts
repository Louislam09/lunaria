import { getStore } from './database';
import { pb } from './pocketbase';
import { parseJsonArray, intToBool } from '@/utils/dbHelpers';

export interface Conflict {
  id: string;
  table: string;
  localData: any;
  remoteData: any;
  localUpdated: Date;
  remoteUpdated: Date;
}

// Detect conflicts during sync
export async function detectConflicts(userId: string): Promise<Conflict[]> {
  const store = getStore();
  const conflicts: Conflict[] = [];

  // Check daily_logs
  const dailyLogsTable = store.getTable('daily_logs');
  const syncedLogs = Object.entries(dailyLogsTable).filter(
    ([_, row]) => row.user_id === userId && intToBool(row.synced as number)
  );

  for (const [id, localLog] of syncedLogs) {
    try {
      const remoteLog = await pb.collection('daily_logs').getOne(id);
      const localUpdated = new Date(localLog.updated_at as string);
      const remoteUpdated = new Date(remoteLog.updated);

      // If both were updated and local is newer, it's a conflict
      if (localUpdated.getTime() > remoteUpdated.getTime() && localLog.updated_at !== remoteLog.updated) {
        conflicts.push({
          id,
          table: 'daily_logs',
          localData: {
            id,
            user_id: localLog.user_id,
            date: localLog.date,
            symptoms: parseJsonArray<string>(localLog.symptoms as string),
            flow: localLog.flow,
            mood: localLog.mood,
            notes: localLog.notes,
          },
          remoteData: remoteLog,
          localUpdated,
          remoteUpdated,
        });
      }
    } catch (error) {
      // Record doesn't exist remotely, not a conflict
    }
  }

  // Similar checks for profiles and cycles...
  return conflicts;
}

// Resolve conflict by keeping local data (user preference)
export async function resolveConflictLocal(conflict: Conflict): Promise<void> {
  const store = getStore();

  // Update sync queue to push local data
  const syncQueueId = `sync_conflict_${conflict.id}`;
  store.setRow('sync_queue', syncQueueId, {
    table_name: conflict.table,
    record_id: conflict.id,
    operation: 'update',
    data: JSON.stringify(conflict.localData),
    created_at: new Date().toISOString(),
  });

  // Mark as unresolved (synced = 0)
  const tableName = conflict.table as 'profiles' | 'daily_logs' | 'cycles';
  store.setCell(tableName, conflict.id, 'synced', 0);
}

// Resolve conflict by keeping remote data
export async function resolveConflictRemote(conflict: Conflict): Promise<void> {
  const store = getStore();

  // Update local data with remote data
  if (conflict.table === 'daily_logs') {
    store.setRow('daily_logs', conflict.id, {
      user_id: conflict.remoteData.user,
      date: conflict.remoteData.date,
      symptoms: JSON.stringify(conflict.remoteData.symptoms || []),
      flow: conflict.remoteData.flow || null,
      mood: conflict.remoteData.mood || null,
      notes: conflict.remoteData.notes || null,
      synced: 1,
      updated_at: conflict.remoteData.updated || new Date().toISOString(),
    });
  }
}

// Auto-resolve conflicts with local preference
export async function autoResolveConflicts(userId: string): Promise<number> {
  const conflicts = await detectConflicts(userId);
  let resolved = 0;

  for (const conflict of conflicts) {
    try {
      await resolveConflictLocal(conflict);
      resolved++;
    } catch (error) {
      console.error(`Failed to resolve conflict ${conflict.id}:`, error);
    }
  }

  return resolved;
}
