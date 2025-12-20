import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from '../theme';

export function ProgressBar({ value = 0, style }: { value?: number; style?: ViewStyle | ViewStyle[] }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <View style={[styles.wrap, style as any]}>
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 8,
    backgroundColor: colors.progressBg,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    backgroundColor: colors.progressFill,
  },
});
