import { ConfigContext, ExpoConfig } from '@expo/config';

const colors = {
    lavender: "#b19feb",
    blush: "#F3B7C6",
    moonWhite: "#f9f9f9",
    textPrimary: "#2E2A38",
    textMuted: "#8E8AA0",
    period: "#fb7185",
    fertile: "#4BAA4E",
    ovulation: "#c58ffc",
};

const IS_DEV = true;
// const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
    if (IS_DEV) {
        return 'com.louislam09.lunaria.dev';
    }

    if (IS_PREVIEW) {
        return 'com.louislam09.lunaria.preview';
    }

    return 'com.louislam09.lunaria';
};

const getAppName = () => {
    if (IS_DEV) {
        return 'Lunaria (Dev)';
    }

    if (IS_PREVIEW) {
        return 'Lunaria (Preview)';
    }

    return 'Lunaria';
};

export default ({ config }: ConfigContext): ExpoConfig => {
    return {
        ...config,
        name: getAppName(),
        slug: 'lunaria',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        scheme: 'lunaria',
        userInterfaceStyle: 'automatic',
        splash: {
            image: './assets/images/splash.png',
            resizeMode: 'cover',
            backgroundColor: '#B9A7E8',
        },
        assetBundlePatterns: ['**/*'],
        ios: {
            supportsTablet: true,
            bundleIdentifier: getUniqueIdentifier(),
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/images/adaptive-icon.png',
                backgroundColor: '#B9A7E8',
            },
            package: getUniqueIdentifier(),
            splash: {
                image: './assets/images/splash.png',
                resizeMode: 'cover',
                backgroundColor: '#B9A7E8',
            }
        },
        web: {
            output: 'static',
            favicon: './assets/images/icon.png',
        },
        plugins: [
            'expo-router',
            'expo-font',
            'expo-sqlite',
            [
                "@react-native-community/datetimepicker",
                {
                    "android": {
                        "datePicker": {
                            "colorAccent": {
                                "light": colors.lavender,
                                "dark": colors.lavender
                            }
                        },
                        "timePicker": {
                            "numbersSelectorColor": {
                                "light": colors.lavender,
                                "dark": colors.lavender
                            }
                        }
                    }
                }
            ],
            [
                'expo-updates',
                {
                    username: 'louislam09',
                },
            ],
            [
                "expo-splash-screen",
                {
                    "backgroundColor": colors.lavender,
                    "image": "./assets/images/splash.png",
                    "dark": {
                        "image": "./assets/images/splash.png",
                        "backgroundColor": colors.lavender
                    },
                }
            ],
            [
                "react-native-edge-to-edge",
                {
                    android: {
                        parentTheme: "Default",
                        enforceNavigationBarContrast: false
                    }
                }
            ],
            [
                "expo-document-picker",
                {
                    "iCloudContainerEnvironment": "Production"
                }
            ],
            [
                "expo-notifications",
                {
                    icon: "./assets/images/icon.png",
                    color: "#0c3e3d",
                    defaultChannel: "default",
                    enableBackgroundRemoteNotifications: true,
                },
            ],
            [
                "expo-image-picker",
                {
                    "photosPermission": "The app accesses your photos to let you set your profile picture."
                }
            ]
        ],
        extra: {
            eas: {
                projectId: "96967cfe-83c1-46f4-81bb-1a1cfb2d5f88"
            },
        },
        updates: {
            fallbackToCacheTimeout: 0,
            checkAutomatically: 'ON_LOAD',
        },
        owner: 'louislam09',
        runtimeVersion: {
            policy: "appVersion",
        }
    };
};
