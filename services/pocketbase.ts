import PocketBase from 'pocketbase';

// TODO: Replace with your PocketBase URL
// For MVP: App works locally without PocketBase
const PB_URL = process.env.EXPO_PUBLIC_POCKETBASE_URL || 'http://localhost:8090';

export const pb = new PocketBase(PB_URL);

// Enable auto cancellation for all pending requests
pb.autoCancellation(false);

// Helper to check if PocketBase is available
export const isPocketBaseAvailable = async (): Promise<boolean> => {
  try {
    // Try to ping PocketBase
    await pb.collections.getFullList({ limit: 1 });
    return true;
  } catch (error) {
    console.log('PocketBase not available, working locally');
    return false;
  }
};