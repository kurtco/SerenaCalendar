import { tokens } from '@repo/ui-native';

export const theme = {
  colors: tokens.color,
  spacing: tokens.spacing,
  radius: tokens.radius,
  typography: tokens.typography,
} as const;

export type Theme = typeof theme;
