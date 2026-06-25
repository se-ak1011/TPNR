import { KeyboardTypeOptions, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  hint?: string;
  keyboardType?: KeyboardTypeOptions;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({ label, hint, containerStyle, ...props }: InputProps) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={Colors.text.muted}
        style={[styles.input, props.multiline ? styles.multiline : undefined]}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
  },
  label: {
    color: Colors.text.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  input: {
    backgroundColor: Colors.background.tertiary,
    borderColor: Colors.border.default,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    color: Colors.text.primary,
    fontSize: Typography.sizes.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  hint: {
    color: Colors.text.muted,
    fontSize: Typography.sizes.xs,
  },
});
