# Lunaria - Setup Instructions

## Required Dependencies

The following packages need to be installed for full functionality:

```bash
yarn add @react-native-async-storage/async-storage
yarn add @react-native-community/datetimepicker
yarn add pocketbase
yarn add expo-notifications
```

## Optional Dependencies (for Export/Import)

For export/import functionality, install:

```bash
yarn add expo-file-system
yarn add expo-sharing
yarn add expo-document-picker
```

## Environment Variables

Create a `.env` file in the root directory:

```
EXPO_PUBLIC_POCKETBASE_URL=http://localhost:8090
```

Or update `services/pocketbase.ts` with your PocketBase URL.

## Project Structure

```
app/
  splash.tsx                    # Splash/welcome screen
  index.tsx                      # Root redirect
  _layout.tsx                    # Root layout with AuthProvider, SyncProvider
  home.tsx                       # Dashboard/home screen
  predictions.tsx                # Predictions screen
  registro.tsx                   # Daily log screen
  calendar.tsx                   # Calendar screen
  settings.tsx                   # Settings screen
  onboarding/
    info.tsx                     # Personal & menstrual info
    pregnancy.tsx                 # Pregnancy goal selection
    contraceptive.tsx             # Contraceptive method selection
    symptoms.tsx                  # Common symptoms selection
context/
  AuthContext.tsx                # Authentication context
  SyncContext.tsx                 # Sync management context
services/
  pocketbase.ts                  # PocketBase client
  database.ts                    # SQLite database initialization
  dataService.ts                 # Data services (DailyLogs, Profiles, Cycles)
  syncService.ts                 # Sync service with configurable frequency
  conflictResolution.ts           # Conflict detection and resolution
  exportImport.ts                # Export/import functionality
utils/
  predictions.ts                 # Cycle prediction logic
  dates.ts                       # Date utilities
  pcosLogic.ts                   # PCOS-related logic
```

## Features Implemented

✅ Splash screen
✅ Onboarding flow (4 steps)
✅ Dashboard/Home screen with cycle predictions
✅ Predictions screen with calendar
✅ Daily log/Registro screen with date navigation
✅ Calendar screen with period tracking
✅ Authentication context (ready for PocketBase integration)
✅ Local-first architecture with SQLite
✅ Configurable sync frequency (daily/weekly/monthly)
✅ Sync status indicator in headers
✅ Conflict resolution with local preference
✅ Export/import functionality
✅ Prediction utilities
✅ Date utilities

## Database Schema

The app uses SQLite with the following tables:
- `profiles`: User profile data
- `daily_logs`: Daily cycle tracking logs
- `cycles`: Menstrual cycle records
- `sync_queue`: Queue of pending sync operations
- `sync_settings`: Sync configuration

## Sync Configuration

Users can configure sync frequency in Settings:
- **Daily**: Syncs every 24 hours
- **Weekly**: Syncs once per week
- **Monthly**: Syncs once per month

Sync happens automatically on app start if needed, or manually via Settings.

## Next Steps

1. Set up PocketBase backend with collections:
   - `users` (auth)
   - `profiles`
   - `daily_logs`
   - `cycles`

2. Configure PocketBase access rules:
   - `@request.auth.id = user.id` for all collections

3. Test sync functionality:
   - Create data offline
   - Sync to PocketBase
   - Verify data persistence
