import * as Haptics from 'expo-haptics';

export function useHaptics() {
  async function impact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) {
    await Haptics.impactAsync(style);
  }

  async function success() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function error() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  return {
    impact,
    success,
    error,
  };
}
