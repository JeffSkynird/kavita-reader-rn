import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useCallback } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { OpdsEntryCard } from '@/features/catalog/components/opds-entry-card';
import { useOpdsRoot } from '@/features/catalog/hooks/use-opds-root';
import type { OpdsEntry, OpdsLink } from '@/features/catalog/types';
import { describeLinkType } from '@/features/catalog/utils';
import { useSession } from '@/providers/session-provider';

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { session } = useSession();
  const { data, isLoading, isRefetching, refetch, error } = useOpdsRoot();

  const handleNavigate = useCallback((entry: OpdsEntry, link: OpdsLink) => {
    const kind = describeLinkType(link);

    if (kind === 'navigation') {
      router.push({
        pathname: '/opds-feed',
        params: {
          href: encodeURIComponent(link.href),
          title: entry.title,
        },
      });

      return;
    }

    if (kind === 'acquisition') {
      router.push({
        pathname: '/opds-entry',
        params: {
          href: encodeURIComponent(link.href),
          title: entry.title,
          type: link.type ?? '',
          rel: link.rel ?? '',
          entryId: entry.id,
          entryTitle: entry.title,
          entryContent: entry.content ?? '',
        },
      });

      return;
    }

    // Unknown link type: show the generic detail view
    router.push({
      pathname: '/opds-entry',
      params: {
        href: encodeURIComponent(link.href),
        title: entry.title,
        type: link.type ?? '',
        rel: link.rel ?? '',
        entryId: entry.id,
        entryTitle: entry.title,
        entryContent: entry.content ?? '',
      },
    });
  }, []);

  if (!session?.apiKey) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Your library</ThemedText>
        <ThemedText style={[styles.caption, { color: palette.icon }]}>
          To load your libraries we need your API Key. Go to Settings and add the API Key from your Kavita profile.
        </ThemedText>
      </ThemedView>
    );
  }

  const entries = data?.entries ?? [];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Your library</ThemedText>
      {data?.updated ? (
        <ThemedText style={[styles.caption, { color: palette.icon }]}>
          Updated by Kavita: {new Date(data.updated).toLocaleString()}
        </ThemedText>
      ) : null}

      {error ? (
        <View
          style={[
            styles.feedbackCard,
            {
              borderColor: '#E5484D',
              backgroundColor: colorScheme === 'dark' ? '#2C1B1C' : '#FFE5E6',
            },
          ]}>
          <ThemedText type="defaultSemiBold">Could not load the feed</ThemedText>
          <ThemedText>{error.message}</ThemedText>
        </View>
      ) : null}

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OpdsEntryCard
            entry={item}
            palette={palette}
            colorScheme={colorScheme}
            onNavigate={handleNavigate}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching && !isLoading} onRefresh={refetch} tintColor={palette.tint} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={palette.tint} />
            </View>
          ) : (
            <View
              style={[
                styles.feedbackCard,
                {
                  borderColor: palette.tabIconDefault,
                  backgroundColor: colorScheme === 'dark' ? '#1F1F23' : '#fff',
                },
              ]}>
              <ThemedText>We couldn't find entries in your OPDS feed.</ThemedText>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingBottom:0,
    gap: 12,
  },
  caption: {},
  listContent: {
    paddingVertical: 12,
    gap: 12,
  },
  separator: {
    height: 12,
  },
  feedbackCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
});
