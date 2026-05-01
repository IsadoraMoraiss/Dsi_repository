import { Colors } from './Colors';
import { fontScale, mScale, scale, vScale } from '../utils/responsive';

export const Spacing = {
  xxs: scale(4),
  xs: scale(8),
  sm: scale(12),
  md: scale(16),
  lg: scale(20),
  xl: scale(24),
  xxl: scale(32),
  pageHorizontal: scale(24),
  pageTop: vScale(96),
} as const;

export const Radius = {
  sm: mScale(8, 0.45),
  md: mScale(12, 0.45),
  lg: mScale(15, 0.45),
  xl: mScale(24, 0.45),
  round: 999,
} as const;

export const Size = {
  logoLg: mScale(200, 0.5),
  logoMd: mScale(180, 0.5),
  buttonHeight: vScale(58),
  inputHeightMd: vScale(56),
  inputHeightSm: vScale(48),
  inputHeightLg: vScale(62),
  otpWidth: scale(44),
  otpHeight: vScale(52),
  homeCardWidth: scale(160),
  homeCardHeight: vScale(255),
  homeCardImageHeight: vScale(118),
  searchBlockHeight: vScale(128),
  footerHeight: vScale(72),
  buttonMaxWidth: scale(271),
  categoryButtonMinWidth: scale(80),
  toastOffsetBottom: vScale(48),
} as const;

export const IconSize = {
  sm: scale(18),
  md: scale(22),
  lg: scale(24),
} as const;

export const Font = {
  caption: fontScale(12),
  body: fontScale(14),
  bodyMd: fontScale(16),
  titleMd: fontScale(18),
  titleLg: fontScale(20),
  titleXl: fontScale(28),
  titleDisplay: fontScale(32),
  otp: fontScale(24),
} as const;

export const Shadow = {
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: vScale(4) },
    shadowOpacity: 0.12,
    shadowRadius: scale(8),
    elevation: 3,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: vScale(1) },
    shadowOpacity: 0.08,
    shadowRadius: scale(2),
    elevation: 1,
  },
} as const;

export const Theme = {
  colors: Colors,
  spacing: Spacing,
  radius: Radius,
  size: Size,
  icon: IconSize,
  font: Font,
  shadow: Shadow,
} as const;

export default Theme;
