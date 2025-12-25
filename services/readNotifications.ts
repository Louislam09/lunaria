import Storage from 'expo-sqlite/kv-store';

const STORAGE_KEY = 'readNotifications';

/**
 * Get all read notification IDs from storage
 */
export async function getReadNotifications(): Promise<Set<string>> {
    try {
        const stored = await Storage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored) as string[];
            return new Set(parsed);
        }
        return new Set<string>();
    } catch (error) {
        console.error('Error loading read notifications:', error);
        return new Set<string>();
    }
}

/**
 * Save read notification IDs to storage
 */
export async function saveReadNotifications(readIds: Set<string>): Promise<void> {
    try {
        const array = Array.from(readIds);
        await Storage.setItem(STORAGE_KEY, JSON.stringify(array));
    } catch (error) {
        console.error('Error saving read notifications:', error);
        throw error;
    }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
    const readIds = await getReadNotifications();
    readIds.add(notificationId);
    await saveReadNotifications(readIds);
}

/**
 * Mark multiple notifications as read
 */
export async function markMultipleAsRead(notificationIds: string[]): Promise<void> {
    const readIds = await getReadNotifications();
    notificationIds.forEach(id => readIds.add(id));
    await saveReadNotifications(readIds);
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(notificationIds: string[]): Promise<void> {
    const readIds = new Set(notificationIds);
    await saveReadNotifications(readIds);
}

/**
 * Clear all read notifications
 */
export async function clearReadNotifications(): Promise<void> {
    try {
        await Storage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing read notifications:', error);
    }
}

/**
 * Check if a notification is read
 */
export async function isNotificationRead(notificationId: string): Promise<boolean> {
    const readIds = await getReadNotifications();
    return readIds.has(notificationId);
}

