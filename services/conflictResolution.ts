import { getDatabase } from './database';
import { pb } from './pocketbase';

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
  const db = await getDatabase();
  const conflicts: Conflict[] = [];

  // Check daily_logs
  const localLogs = await db.getAllAsync<{
    id: string;
    date: string;
    symptoms: string;
    flow: string;
    mood: string;
    notes: string;
    updated_at: string;
    synced: number;
  }>(`SELECT * FROM daily_logs WHERE user_id = ? AND synced = 1`, [userId]);

  for (const localLog of localLogs) {
    try {
      const remoteLog = await pb.collection('daily_logs').getOne(localLog.id);
      const localUpdated = new Date(localLog.updated_at);
      const remoteUpdated = new Date(remoteLog.updated);

      // If both were updated and local is newer, it's a conflict
      if (localUpdated.getTime() > remoteUpdated.getTime() && localLog.updated_at !== remoteLog.updated) {
        conflicts.push({
          id: localLog.id,
          table: 'daily_logs',
          localData: {
            ...localLog,
            symptoms: JSON.parse(localLog.symptoms || '[]'),
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
  const db = await getDatabase();

  // Update sync queue to push local data
  await db.runAsync(
    `INSERT OR REPLACE INTO sync_queue (id, table_name, record_id, operation, data)
     VALUES (?, ?, ?, 'update', ?)`,
    [
      `sync_conflict_${conflict.id}`,
      conflict.table,
      conflict.id,
      JSON.stringify(conflict.localData),
    ]
  );

  // Mark as resolved
  await db.runAsync(
    `UPDATE ${conflict.table} SET synced = 0 WHERE id = ?`,
    [conflict.id]
  );
}

// Resolve conflict by keeping remote data
export async function resolveConflictRemote(conflict: Conflict): Promise<void> {
  const db = await getDatabase();

  // Update local data with remote data
  if (conflict.table === 'daily_logs') {
    await db.runAsync(
      `UPDATE daily_logs 
       SET symptoms = ?, flow = ?, mood = ?, notes = ?, synced = 1, updated_at = ?
       WHERE id = ?`,
      [
        JSON.stringify(conflict.remoteData.symptoms || []),
        conflict.remoteData.flow,
        conflict.remoteData.mood,
        conflict.remoteData.notes,
        conflict.remoteData.updated,
        conflict.id,
      ]
    );
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

