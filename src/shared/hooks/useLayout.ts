import { useWindowDimensions } from 'react-native';

export function useLayout() {
  const { width, height, fontScale } = useWindowDimensions();

  return {
    width,
    height,
    fontScale,
    isSmall: width < 380,
    isTablet: width >= 768,
  };
}
