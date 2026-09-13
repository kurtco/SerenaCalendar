import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '@repo/ui-native';

export function HomeScreen(): React.ReactElement {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Serena</Text>
      <Text style={styles.body}>Tu calendario está listo.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.color.background,
    paddingHorizontal: tokens.spacing.lg,
  },
  title: {
    ...tokens.typography.title,
    color: tokens.color.textPrimary,
    marginBottom: tokens.spacing.md,
    textAlign: 'center',
  },
  body: {
    ...tokens.typography.body,
    color: tokens.color.textSecondary,
    textAlign: 'center',
  },
});
