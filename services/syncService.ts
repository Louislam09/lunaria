import { getDatabase } from './database';
import { pb } from './pocketbase';
import * as SQLite from 'expo-sqlite';

export type SyncFrequency = 'daily' | 'weekly' | 'monthly';

// Get sync frequency from settings
export async function getSyncFrequency(): Promise<SyncFrequency> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ value: string }>(
        `SELECT value FROM sync_settings WHERE key = 'sync_frequency'`
    );
    return (result?.value as SyncFrequency) || 'daily';
}

// Set sync frequency
export async function setSyncFrequency(frequency: SyncFrequency): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
        `INSERT OR REPLACE INTO sync_settings (key, value, updated_at) 
     VALUES ('sync_frequency', ?, CURRENT_TIMESTAMP)`,
        [frequency]
    );
}

// Check if sync is needed based on last sync time and frequency
export async function shouldSync(): Promise<boolean> {
    const db = await getDatabase();
    const frequency = await getSyncFrequency();

    const result = await db.getFirstAsync<{ value: string }>(
        `SELECT value FROM sync_settings WHERE key = 'last_sync_time'`
    );

    if (!result) return true; // Never synced

    const lastSync = new Date(result.value);
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();

    switch (frequency) {
        case 'daily':
            return diffMs >= 24 * 60 * 60 * 1000; // 24 hours
        case 'weekly':
            return diffMs >= 7 * 24 * 60 * 60 * 1000; // 7 days
        case 'monthly':
            return diffMs >= 30 * 24 * 60 * 60 * 1000; // 30 days
        default:
            return true;
    }
}

// Perform sync: push local changes to PocketBase
export async function syncToPocketBase(): Promise<{ success: number; failed: number }> {
    const db = await getDatabase();
    const queue = await db.getAllAsync<{
        id: string;
        table_name: string;
        record_id: string;
        operation: string;
        data: string;
    }>(`SELECT * FROM sync_queue ORDER BY created_at ASC`);

    let success = 0;
    let failed = 0;

    for (const item of queue) {
        try {
            const data = JSON.parse(item.data || '{}');

            if (item.operation === 'create') {
                const result = await pb.collection(item.table_name).create(data);

                // Update local record with PocketBase ID
                await db.runAsync(
                    `UPDATE ${item.table_name} SET id = ?, synced = 1 WHERE id = ?`,
                    [result.id, item.record_id]
                );
            } else if (item.operation === 'update') {
                await pb.collection(item.table_name).update(item.record_id, data);
                await db.runAsync(
                    `UPDATE ${item.table_name} SET synced = 1 WHERE id = ?`,
                    [item.record_id]
                );
            } else if (item.operation === 'delete') {
                await pb.collection(item.table_name).delete(item.record_id);
            }

            // Remove from queue
            await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [item.id]);
            success++;
        } catch (error: any) {
            console.error(`Sync failed for ${item.table_name}/${item.record_id}:`, error);
            failed++;

            // If it's a network error, keep in queue for retry
            // If it's a validation error, remove from queue
            if (error?.status === 400 || error?.status === 404) {
                await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [item.id]);
            }
        }
    }

    // Update last sync time
    await db.runAsync(
        `INSERT OR REPLACE INTO sync_settings (key, value, updated_at) 
     VALUES ('last_sync_time', ?, CURRENT_TIMESTAMP)`,
        [new Date().toISOString()]
    );

    return { success, failed };
}

// Sync from PocketBase to local DB
export async function syncFromPocketBase(userId: string): Promise<void> {
    const db = await getDatabase();

    try {
        // Fetch from PocketBase
        const [profiles, logs, cycles] = await Promise.all([
            pb.collection('profiles').getFullList({ filter: `user = "${userId}"` }).catch(() => []),
            pb.collection('daily_logs').getFullList({ filter: `user = "${userId}"` }).catch(() => []),
            pb.collection('cycles').getFullList({ filter: `user = "${userId}"` }).catch(() => []),
        ]);

        // Save profiles to local DB
        for (const profile of profiles) {
            await db.runAsync(
                `INSERT OR REPLACE INTO profiles 
         (id, user_id, name, birth_date, cycle_type, average_cycle_length, 
          cycle_range_min, cycle_range_max, period_length, has_pcos, 
          pcos_symptoms, pcos_treatment, contraceptive_method, wants_pregnancy, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                [
                    profile.id,
                    profile.user,
                    profile.name,
                    profile.birthDate,
                    profile.cycleType,
                    profile.averageCycleLength,
                    profile.cycleRangeMin,
                    profile.cycleRangeMax,
                    profile.averagePeriodLength,
                    profile.hasPCOS ? 1 : 0,
                    JSON.stringify(profile.pcosSymptoms || []),
                    JSON.stringify(profile.pcosTreatment || []),
                    profile.contraceptiveMethod,
                    profile.wantsPregnancy ? 1 : 0,
                ]
            );
        }

        // Save daily logs to local DB
        for (const log of logs) {
            await db.runAsync(
                `INSERT OR REPLACE INTO daily_logs 
         (id, user_id, date, symptoms, flow, mood, notes, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
                [
                    log.id,
                    log.user,
                    log.date,
                    JSON.stringify(log.symptoms || []),
                    log.flow,
                    log.mood,
                    log.notes,
                ]
            );
        }

        // Save cycles to local DB
        for (const cycle of cycles) {
            await db.runAsync(
                `INSERT OR REPLACE INTO cycles 
         (id, user_id, start_date, end_date, synced)
         VALUES (?, ?, ?, ?, 1)`,
                [cycle.id, cycle.user, cycle.startDate, cycle.endDate]
            );
        }

        // Update last sync time
        await db.runAsync(
            `INSERT OR REPLACE INTO sync_settings (key, value, updated_at) 
       VALUES ('last_sync_time', ?, CURRENT_TIMESTAMP)`,
            [new Date().toISOString()]
        );
    } catch (error) {
        console.error('Sync from PocketBase failed:', error);
        throw error;
    }
}

// Perform full sync (both directions)
export async function performSync(userId?: string): Promise<{ success: number; failed: number; conflicts?: number }> {
    if (!userId && pb.authStore.model) {
        userId = pb.authStore.model.id;
    }

    if (!userId) {
        throw new Error('User not authenticated');
    }

    // First sync from PocketBase (get latest data)
    await syncFromPocketBase(userId);

    // Auto-resolve conflicts with local preference
    const { autoResolveConflicts } = await import('./conflictResolution');
    const conflictsResolved = await autoResolveConflicts(userId);

    // Then sync to PocketBase (push local changes)
    const result = await syncToPocketBase();

    return { ...result, conflicts: conflictsResolved };
}

// Get sync status
export async function getSyncStatus(): Promise<{
    lastSyncTime: Date | null;
    pendingItems: number;
    frequency: SyncFrequency;
}> {
    const db = await getDatabase();

    const [lastSyncResult, queueResult, frequencyResult] = await Promise.all([
        db.getFirstAsync<{ value: string }>(
            `SELECT value FROM sync_settings WHERE key = 'last_sync_time'`
        ),
        db.getFirstAsync<{ count: number }>(
            `SELECT COUNT(*) as count FROM sync_queue`
        ),
        db.getFirstAsync<{ value: string }>(
            `SELECT value FROM sync_settings WHERE key = 'sync_frequency'`
        ),
    ]);

    return {
        lastSyncTime: lastSyncResult?.value ? new Date(lastSyncResult.value) : null,
        pendingItems: queueResult?.count || 0,
        frequency: (frequencyResult?.value as SyncFrequency) || 'daily',
    };
}

