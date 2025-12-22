import { ConfigContext, ExpoConfig } from '@expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
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
            [
                'expo-updates',
                {
                    username: 'louislam09',
                },
            ],
            'expo-font',
            'expo-sqlite',
            "@react-native-community/datetimepicker",
            [
                "expo-splash-screen",
                {
                    "backgroundColor": "#B9A7E8",
                    "image": "./assets/images/splash.png",
                    "dark": {
                        "image": "./assets/images/splash.png",
                        "backgroundColor": "#B9A7E8"
                    },
                }
            ]
        ],
        extra: {
            eas: {
                projectId: '',
            },
        },
        updates: {
            url: '',
        },
        owner: 'louislam09',
        runtimeVersion: '1.0.0',
    };
};
