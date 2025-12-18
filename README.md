# Lunaria - Menstrual Cycle Tracking App

A React Native app built with Expo Router for tracking menstrual cycles, built for Spanish-speaking users.

## Features

- 🎯 **Onboarding Flow**: Multi-step setup for personalizing the experience
- 📊 **Dashboard**: View cycle predictions and current phase
- 📅 **Calendar**: Visual calendar with period tracking
- 📈 **Predictions**: Cycle predictions with ovulation and fertile window
- 📝 **Daily Log**: Record symptoms, mood, flow, and notes
- 🔐 **Authentication**: Guest mode and authenticated mode with PocketBase

## Getting Started

### Prerequisites

- Node.js >= 20.19.4
- Yarn package manager
- Expo CLI

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Install additional required packages:
```bash
yarn add @react-native-async-storage/async-storage
yarn add @react-native-community/datetimepicker
yarn add pocketbase
yarn add expo-notifications
```

3. Set up environment variables:
Create a `.env` file:
```
EXPO_PUBLIC_POCKETBASE_URL=http://localhost:8090
```

4. Start the development server:
```bash
yarn start
```

## Project Structure

```
src/
  app/                    # Expo Router screens
    splash.tsx           # Welcome screen
    home.tsx             # Dashboard
    predictions.tsx      # Cycle predictions
    registro.tsx         # Daily log
    calendar.tsx         # Calendar view
    settings.tsx         # Settings
    onboarding/          # Onboarding flow
  context/               # React contexts
    AuthContext.tsx      # Authentication state
  services/             # API services
    pocketbase.ts       # PocketBase client
    authService.ts      # Auth helpers
    notifications.ts    # Push notifications
  utils/                # Utility functions
    predictions.ts     # Cycle calculations
    dates.ts           # Date helpers
    pcosLogic.ts       # PCOS logic
```

## Architecture

The app follows the design document in `doc/lunaria-design.md`:

- **Guest Mode**: Users can explore the app without authentication
- **Authenticated Mode**: Full data persistence with PocketBase
- **Onboarding**: Adaptive flow that collects user information
- **Predictions**: Cycle prediction based on user data

## Screens

### Onboarding
1. Personal & Menstrual Info (`/onboarding/info`)
2. Pregnancy Goal (`/onboarding/pregnancy`)
3. Contraceptive Method (`/onboarding/contraceptive`)
4. Common Symptoms (`/onboarding/symptoms`)

### Main App
- Dashboard (`/home`)
- Predictions (`/predictions`)
- Calendar (`/calendar`)
- Daily Log (`/registro`)
- Settings (`/settings`)

## Development Notes

- The app uses NativeWind (Tailwind CSS for React Native)
- Some features require additional packages (see SETUP.md)
- PocketBase backend needs to be set up separately
- Date pickers and notifications have placeholder implementations until packages are installed

## License

Private project
