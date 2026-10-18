import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useDiary } from '@/state/diary';
export { ErrorBoundary } from 'expo-router';

export default function Layout() {
  useEffect(() => {
    void useDiary.getState().hydrate();
    if (Platform.OS === 'web' && !__DEV__ && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((error) => console.warn('Offline setup unavailable:', error));
    }
  }, []);
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="meal" />
      </Stack>
    </>
  );
}
