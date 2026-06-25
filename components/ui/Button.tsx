import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}: ButtonProps) {
  const palette = palettes[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: pressed || disabled ? 0.8 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={palette.color} /> : icon}
        <Text style={[styles.title, { color: palette.color }]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const palettes: Record<ButtonVariant, { backgroundColor: string; borderColor: string; color: string }> = {
  primary: {
    backgroundColor: Colors.accent.gold,
    borderColor: Colors.accent.gold,
    color: Colors.text.inverse,
  },
  secondary: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.accent,
    color: Colors.text.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: Colors.border.default,
    color: Colors.text.secondary,
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
});
