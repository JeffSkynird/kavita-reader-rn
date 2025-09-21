import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useCallback } from 'react';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { OpdsEntryCard } from '@/features/catalog/components/opds-entry-card';
import { useOpdsFeed } from '@/features/catalog/hooks/use-opds-feed';
import type { OpdsEntry, OpdsLink } from '@/features/catalog/types';
import { describeLinkType } from '@/features/catalog/utils';

export default function OpdsFeedScreen() {
  const params = useLocalSearchParams<{ href?: string; title?: string }>();
  const href = typeof params.href === 'string' ? decodeURIComponent(params.href) : undefined;
  const providedTitle = typeof params.title === 'string' ? params.title : undefined;

  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  const { data, isLoading, isRefetching, refetch, error } = useOpdsFeed(href);

  const screenTitle = providedTitle ?? data?.title ?? 'OPDS section';

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

  if (!href) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">OPDS feed</ThemedText>
        <ThemedText>No valid feed link was provided.</ThemedText>
      </ThemedView>
    );
  }

  const entries = data?.entries ?? [];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: screenTitle }} />

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
        ListHeaderComponent={
          data?.title ? (
            <View style={styles.headerBlock}>
              <ThemedText type="subtitle">{data.title}</ThemedText>
              {data.links.length ? (
                <View style={styles.linksContainer}>
                  {data.links.map((link) => (
                    <ThemedText key={link.href} style={[styles.linkLabel, { color: palette.icon }]}>
                      {link.rel ?? 'link'} → {link.href}
                    </ThemedText>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null
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
              <ThemedText>We couldn't find entries in this feed.</ThemedText>
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
  headerBlock: {
    marginBottom: 12,
    gap: 8,
  },
  linksContainer: {
    gap: 4,
  },
  linkLabel: {
    fontSize: 12,
  },
});
