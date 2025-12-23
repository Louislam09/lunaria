import PocketBase from 'pocketbase';

// TODO: Replace with your PocketBase URL
const PB_URL = process.env.EXPO_PUBLIC_POCKETBASE_URL || 'http://localhost:8090';

export const pb = new PocketBase(PB_URL);

// Enable auto cancellation for all pending requests
pb.autoCancellation(false);