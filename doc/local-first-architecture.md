# Local-First Architecture with Expo SQLite

## Overview

Lunaria now uses a **local-first architecture** with Expo SQLite for offline data storage and PocketBase for cloud synchronization and authentication.

## Architecture

### Database Layer (`services/database.ts`)

- **SQLite Database**: `lunaria.db`
- **Tables**:
  - `profiles`: User profile data
  - `daily_logs`: Daily cycle tracking logs
  - `cycles`: Menstrual cycle records
  - `sync_queue`: Queue of pending sync operations
  - `sync_settings`: Sync configuration (frequency, last sync time)

### Data Services (`services/dataService.ts`)

Three main services:
- **DailyLogsService**: CRUD operations for daily logs
- **ProfilesService**: Profile management
- **CyclesService**: Cycle tracking

All operations:
1. Save to local SQLite immediately (works offline)
2. Queue changes for sync to PocketBase
3. Return immediately (no waiting for network)

### Sync Service (`services/syncService.ts`)

**Features**:
- Configurable sync frequency (daily/weekly/monthly)
- Automatic sync check on app start
- Manual sync trigger
- Bidirectional sync:
  - **syncToPocketBase**: Push local changes to cloud
  - **syncFromPocketBase**: Pull latest data from cloud

**Sync Frequency**:
- **Daily**: Syncs every 24 hours
- **Weekly**: Syncs every 7 days
- **Monthly**: Syncs every 30 days

### Sync Context (`context/SyncContext.tsx`)

Provides React hooks for:
- `useSync()`: Access sync status and controls
- Auto-refreshes sync status every 30 seconds
- Checks if sync is needed on app start
- Performs auto-sync when needed

## User Flow

### Saving Data (Offline-First)

1. User saves daily log → Saved to SQLite immediately
2. Change queued in `sync_queue` table
3. UI updates instantly (no network delay)
4. Sync happens automatically based on frequency OR manually

### Syncing

1. **Automatic**: Checks on app start if sync is needed based on frequency
2. **Manual**: User taps "Sincronizar Ahora" in settings
3. Process:
   - Pull latest data from PocketBase
   - Push local changes to PocketBase
   - Update sync status

### Offline Support

- All reads come from local SQLite (instant)
- All writes save to SQLite first (instant)
- Changes queued for sync when online
- App works fully offline

## Settings

Users can configure sync frequency in Settings:
- **Diario**: Syncs every day
- **Semanal**: Syncs once per week
- **Mensual**: Syncs once per month

Shows:
- Last sync time
- Pending items count
- Manual sync button

## Benefits

1. **Instant UI**: No network delays
2. **Offline Support**: Full functionality without internet
3. **Data Safety**: Local copy always available
4. **Battery Efficient**: Syncs only when needed
5. **User Control**: Choose sync frequency

## Technical Details

### Database Schema

```sql
-- Daily logs
CREATE TABLE daily_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  symptoms TEXT, -- JSON array
  flow TEXT,
  mood TEXT,
  notes TEXT,
  synced INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

-- Sync queue
CREATE TABLE sync_queue (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'create', 'update', 'delete'
  data TEXT, -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Sync Queue Operations

- **create**: New record to create in PocketBase
- **update**: Existing record to update
- **delete**: Record to delete

Failed syncs stay in queue for retry (except validation errors which are removed).

## Future Enhancements

- Background sync task (requires `expo-background-fetch`)
- Conflict resolution UI
- Sync progress indicator
- Export/import functionality

