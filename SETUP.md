# Lunaria - Setup Instructions

## Required Dependencies

The following packages need to be installed for full functionality:

```bash
yarn add @react-native-async-storage/async-storage
yarn add @react-native-community/datetimepicker
yarn add pocketbase
yarn add expo-notifications
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
  _layout.tsx                    # Root layout with AuthProvider
  home.tsx                       # Dashboard/home screen
  predictions.tsx                # Predictions screen
  registro.tsx                   # Daily log screen
  calendar.tsx                   # Calendar screen
  settings.tsx                   # Settings screen
  onboarding/
    info.tsx                     # Personal & menstrual info
    pregnancy.tsx                # Pregnancy goal selection
    contraceptive.tsx            # Contraceptive method selection
    symptoms.tsx                 # Common symptoms selection
context/
  AuthContext.tsx                # Authentication context
services/
  pocketbase.ts                  # PocketBase client
  authService.ts                 # Auth service wrappers
  notifications.ts               # Push notifications
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
✅ Daily log/Registro screen
✅ Calendar screen with period tracking
✅ Authentication context (ready for PocketBase integration)
✅ Prediction utilities
✅ Date utilities

## Next Steps

1. Install the required dependencies listed above
2. Set up PocketBase backend with the collections described in `doc/lunaria-design.md`
3. Replace placeholder AsyncStorage implementation with actual package
4. Replace placeholder DateTimePicker with actual package
5. Replace placeholder Notifications with actual expo-notifications
6. Connect screens to actual data from PocketBase
7. Implement authentication guards for save actions
8. Add login modal component for guest users trying to save

## Running the App

```bash
yarn start
```

Then press `i` for iOS, `a` for Android, or `w` for web.
