import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'dark' | 'warm' | 'muted';
}

export function Card({ children, style, tone = 'dark' }: CardProps) {
  return <View style={[styles.card, toneStyles[tone], style]}>{children}</View>;
}

const toneStyles = StyleSheet.create({
  dark: {
    backgroundColor: Colors.background.secondary,
    borderColor: Colors.border.default,
  },
  warm: {
    backgroundColor: Colors.text.primary,
    borderColor: Colors.text.primary,
  },
  muted: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.subtle,
  },
});

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
});
