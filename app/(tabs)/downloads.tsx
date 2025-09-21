import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSession } from '@/providers/session-provider';

export default function DownloadsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { session } = useSession();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Downloads</ThemedText>
      <ThemedText style={[styles.caption, { color: palette.icon }]}>
        Manage downloaded books to read offline.
      </ThemedText>
      {session ? (
        <View
          style={[
            styles.sessionBadge,
            {
              borderColor: palette.tabIconDefault,
              backgroundColor: colorScheme === 'dark' ? '#1F1F23' : '#fff',
            },
          ]}>
          <ThemedText type="defaultSemiBold">Connected server:</ThemedText>
          <ThemedText numberOfLines={1}>{session.baseUrl}</ThemedText>
        </View>
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
  caption: {},
  placeholderCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  sessionBadge: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
});
