import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, ViewStyle, TextStyle } from 'react-native';
import { colors, radius, spacing } from '../theme';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';

type Props = {
  title?: string;
  children?: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  variant?: Variant;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
};

export function Button({ title, children, onPress, disabled, variant = 'primary', style, textStyle }: Props) {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';

  const base = [
    styles.base,
    isOutline && { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 },
    isGhost && { backgroundColor: 'transparent' },
    isDanger && { backgroundColor: colors.danger },
    style as any,
    disabled && { opacity: 0.6 },
  ];

  const tBase = [
    styles.text,
    (isOutline || isGhost) && { color: colors.text },
    isDanger && { color: '#fff' },
    textStyle as any,
  ];

  return (
    <TouchableOpacity activeOpacity={0.8} style={base} onPress={onPress} disabled={disabled}>
      {typeof children !== 'undefined' ? (
        children
      ) : (
        <Text style={tBase}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
  },
});
