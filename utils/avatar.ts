import { ImageSourcePropType } from 'react-native';

/**
 * Get the avatar source for a user, falling back to default avatar if no custom avatar is set
 * @param avatarUrl - Optional custom avatar URL
 * @returns ImageSourcePropType that can be used with Image or MyImage components
 */
export function getAvatarSource(avatarUrl?: string): ImageSourcePropType {
  return avatarUrl 
    ? { uri: avatarUrl }
    : require('@/assets/images/avatar.jpg');
}

