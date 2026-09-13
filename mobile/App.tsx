import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { bootstrap } from './src/bootstrap';
import { DependenciesProvider } from './src/presentation/providers/DependenciesProvider';
import { HomeScreen } from './src/presentation/screens/HomeScreen';
import { OnboardingScreen } from './src/presentation/screens/OnboardingScreen';
import { SplashScreen } from './src/presentation/screens/SplashScreen';

export default function App() {
  const [deps, setDeps] = useState<Awaited<
    ReturnType<typeof bootstrap>
  > | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    bootstrap()
      .then((d) => {
        if (!cancelled) {
          setDeps(d);
          setOnboardingCompleted(d.prefs.getOnboardingCompleted());
        }
      })
      .catch((err) => {
        console.error('Bootstrap failed:', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!deps) {
    return (
      <>
        <SplashScreen onReady={() => setShowSplash(false)} />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <DependenciesProvider deps={deps}>
      {showSplash ? (
        <SplashScreen onReady={() => setShowSplash(false)} />
      ) : onboardingCompleted ? (
        <HomeScreen />
      ) : (
        <OnboardingScreen onComplete={() => setOnboardingCompleted(true)} />
      )}
      <StatusBar style="auto" />
    </DependenciesProvider>
  );
}
