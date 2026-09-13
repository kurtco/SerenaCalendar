import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { tokens } from '@repo/ui-native';

interface SplashScreenProps {
  onReady?: () => void;
}

export function SplashScreen({
  onReady,
}: SplashScreenProps): React.ReactElement {
  useEffect(() => {
    // Bootstrap is handled by the parent; this splash simply allows mounting.
    const timer = setTimeout(() => {
      onReady?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Serena</Text>
      <ActivityIndicator color={tokens.color.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.background,
  },
  title: {
    ...tokens.typography.title,
    color: tokens.color.primary,
    marginBottom: tokens.spacing.md,
  },
});
