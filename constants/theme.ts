export const Colors = {
  background: {
    primary: '#0F0F0F',
    secondary: '#1A1A1A',
    tertiary: '#242424',
    card: '#1E1E1E',
  },
  text: {
    primary: '#F5F3EF',
    secondary: '#A8A29E',
    muted: '#6B6560',
    inverse: '#0F0F0F',
  },
  accent: {
    gold: '#C9A96E',
    goldDark: '#B8A054',
    olive: '#8B9B5A',
    oliveLight: '#9CAB6A',
  },
  status: {
    draft: '#6B6560',
    submitted: '#4A90D9',
    viewed: '#7B68EE',
    shortlisted: '#C9A96E',
    viewingInvited: '#8B9B5A',
    notSelected: '#E05252',
    accepted: '#52A45E',
  },
  border: {
    default: '#2A2A2A',
    subtle: '#232323',
    accent: '#C9A96E40',
  },
  error: '#E05252',
  success: '#52A45E',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    xxxl: 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};
