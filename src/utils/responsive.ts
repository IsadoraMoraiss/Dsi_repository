import { Dimensions, PixelRatio, useWindowDimensions } from 'react-native';

const BASE_WIDTH = 375;
const BASE_HEIGHT = 820;

const MIN_SCALE = 0.82;
const MAX_SCALE = 1.24;
const MIN_FONT_SCALE = 0.88;
const MAX_FONT_SCALE = 1.18;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function dimensions() {
  const { width, height } = Dimensions.get('window');
  return { width, height };
}

function ratioX() {
  const { width } = dimensions();
  return clamp(width / BASE_WIDTH, MIN_SCALE, MAX_SCALE);
}

function ratioY() {
  const { height } = dimensions();
  return clamp(height / BASE_HEIGHT, MIN_SCALE, MAX_SCALE);
}

export function scale(value: number) {
  return Math.round(PixelRatio.roundToNearestPixel(value * ratioX()));
}

export function vScale(value: number) {
  return Math.round(PixelRatio.roundToNearestPixel(value * ratioY()));
}

export function mScale(value: number, factor = 0.5) {
  const scaled = scale(value);
  return Math.round(value + (scaled - value) * factor);
}

export function fontScale(value: number) {
  const { width, height } = dimensions();
  const mixedRatio = ((width / BASE_WIDTH) + (height / BASE_HEIGHT)) / 2;
  const clampedRatio = clamp(mixedRatio, MIN_FONT_SCALE, MAX_FONT_SCALE);
  return Math.round(PixelRatio.roundToNearestPixel(value * clampedRatio));
}

export function makeResponsive(width: number, height: number) {
  const xRatio = clamp(width / BASE_WIDTH, MIN_SCALE, MAX_SCALE);
  const yRatio = clamp(height / BASE_HEIGHT, MIN_SCALE, MAX_SCALE);
  const mixedRatio = clamp((xRatio + yRatio) / 2, MIN_FONT_SCALE, MAX_FONT_SCALE);

  return {
    width,
    height,
    scaleX: (value: number) => Math.round(PixelRatio.roundToNearestPixel(value * xRatio)),
    scaleY: (value: number) => Math.round(PixelRatio.roundToNearestPixel(value * yRatio)),
    moderate: (value: number, factor = 0.5) => {
      const scaled = Math.round(PixelRatio.roundToNearestPixel(value * xRatio));
      return Math.round(value + (scaled - value) * factor);
    },
    font: (value: number) =>
      Math.round(PixelRatio.roundToNearestPixel(value * mixedRatio)),
  };
}

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  return makeResponsive(width, height);
}

export const ResponsiveBase = {
  width: BASE_WIDTH,
  height: BASE_HEIGHT,
} as const;
