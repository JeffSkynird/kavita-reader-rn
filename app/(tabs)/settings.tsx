import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSession } from '@/providers/session-provider';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { session, signOut } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Settings</ThemedText>
      {session ? (
        <ThemedText>
          Connected to: <ThemedText type="defaultSemiBold">{session.baseUrl}</ThemedText>
        </ThemedText>
      ) : (
        <ThemedText>No active session.</ThemedText>
      )}
      {session ? (
        <Pressable
          accessibilityRole="button"
          onPress={handleSignOut}
          style={[styles.button, { backgroundColor: palette.tint }]}>
          <ThemedText type="defaultSemiBold" style={styles.buttonLabel}>
            Sign out
          </ThemedText>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  button: {
    marginTop: 'auto',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#fff',
  },
});
