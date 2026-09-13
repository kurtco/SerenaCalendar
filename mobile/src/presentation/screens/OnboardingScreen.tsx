import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SerenaButton, tokens } from '@repo/ui-native';
import { useDependencies } from '../hooks/useDependencies';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps): React.ReactElement {
  const { completeOnboarding } = useDependencies();

  const handlePress = () => {
    completeOnboarding.execute();
    onComplete();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenida a Serena</Text>
      <Text style={styles.body}>
        Tu calendario menstrual, privado y offline.
      </Text>
      <SerenaButton
        label="Comenzar"
        onPress={handlePress}
        testID="onboarding-button"
      />
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
    marginBottom: tokens.spacing.lg,
    textAlign: 'center',
  },
});
