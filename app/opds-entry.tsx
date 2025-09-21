import * as FileSystem from 'expo-file-system/legacy';
import * as Linking from 'expo-linking';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Alert, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { resolveOpdsHref } from '@/features/catalog/opds-client';
import type { OpdsEntry, OpdsLink } from '@/features/catalog/types';
import { describeLinkType } from '@/features/catalog/utils';
import { useDownloadOpdsEntry } from '@/features/downloads/hooks/use-download-opds-entry';
import { useDownloadsStore } from '@/features/downloads/store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSession } from '@/providers/session-provider';

async function openExternal(url: string) {
  try {
    await Linking.openURL(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not open the link.';
    Alert.alert('Could not open the link', message);
  }
}

async function openLocalFile(uri: string, mimeType?: string) {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, mimeType ? { mimeType } : undefined);
      return;
    }

    if (Platform.OS === 'android') {
      const contentUri = await FileSystem.getContentUriAsync(uri);
      await Linking.openURL(contentUri);
      return;
    }

    await Linking.openURL(uri);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not open the local file.';
    Alert.alert('Error', message);
  }
}

export default function OpdsEntryDetailScreen() {
  const params = useLocalSearchParams<{
    href?: string;
    title?: string;
    type?: string;
    rel?: string;
    entryId?: string;
    entryTitle?: string;
    entryContent?: string;
  }>();
  const href = typeof params.href === 'string' ? decodeURIComponent(params.href) : undefined;
  const title = typeof params.title === 'string' ? params.title : 'Detail';
  const type = typeof params.type === 'string' && params.type ? params.type : undefined;
  const rel = typeof params.rel === 'string' && params.rel ? params.rel : undefined;
  const entryId = typeof params.entryId === 'string' && params.entryId ? params.entryId : href ?? 'entry';
  const entryContent = typeof params.entryContent === 'string' && params.entryContent ? params.entryContent : undefined;

  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { session } = useSession();

  const link: OpdsLink | null = href
    ? {
        href,
        type,
        rel,
      }
    : null;

  const entry: OpdsEntry = {
    id: entryId,
    title,
    content: entryContent,
    links: link ? [link] : [],
  };

  const resolvedUrl = session && href ? resolveOpdsHref(session.baseUrl, href) : href;
  const kind = describeLinkType({ href: href ?? '', type, rel });

  const downloadItem = useDownloadsStore((state) =>
    resolvedUrl ? Object.values(state.items).find((item) => item.resolvedUrl === resolvedUrl) : undefined,
  );
  const downloadMutation = useDownloadOpdsEntry(entry, link);

  const isDownloading = downloadItem?.status === 'downloading' || downloadMutation.isPending;
  const downloadError = downloadItem?.status === 'error' ? downloadItem.errorMessage : undefined;
  const canDownload = kind === 'acquisition' && Boolean(link?.href);
  const progressPercent = downloadItem?.progress ? Math.round(downloadItem.progress * 100) : 0;
  const hasCompleted = downloadItem?.status === 'completed' && downloadItem.localUri;

  const downloadButtonLabel = hasCompleted
    ? 'Open local file'
    : isDownloading
      ? `Downloading... ${progressPercent}%`
      : 'Download / Open';

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title }} />

      <ThemedText type="title">{title}</ThemedText>

      {href ? (
        <ThemedText style={[styles.caption, { color: palette.icon }]}>{href}</ThemedText>
      ) : (
        <ThemedText style={[styles.caption, { color: '#E5484D' }]}>Link unavailable.</ThemedText>
      )}

      <View
        style={[
          styles.infoCard,
          {
            borderColor: palette.tabIconDefault,
            backgroundColor: colorScheme === 'dark' ? '#1F1F23' : '#fff',
          },
        ]}>
        <ThemedText type="defaultSemiBold">Link type</ThemedText>
        <ThemedText>{kind === 'acquisition' ? 'Downloadable file' : kind === 'navigation' ? 'OPDS section' : 'Unknown'}</ThemedText>

        {type ? (
          <ThemedText style={styles.metaText}>MIME: {type}</ThemedText>
        ) : null}
        {rel ? (
          <ThemedText style={styles.metaText}>Rel: {rel}</ThemedText>
        ) : null}
      </View>

      <View style={styles.actions}>
        {canDownload && href ? (
          <Pressable
            accessibilityRole="button"
            disabled={isDownloading}
            onPress={async () => {
              if (hasCompleted && downloadItem?.localUri) {
                await openLocalFile(downloadItem.localUri, type);
                return;
              }

              try {
                await downloadMutation.mutateAsync();
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Could not start the download.';
                Alert.alert('Download error', message);
              }
            }}
            style={[
              styles.primaryButton,
              { backgroundColor: palette.tint },
              (isDownloading || !canDownload) && styles.primaryButtonDisabled,
            ]}
          >
            <ThemedText type="defaultSemiBold" style={styles.primaryButtonLabel}>
              {downloadButtonLabel}
            </ThemedText>
          </Pressable>
        ) : null}

        {kind === 'navigation' && href ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => openExternal(resolvedUrl ?? href)}
            style={[styles.secondaryButton, { borderColor: palette.tabIconDefault }]}
          >
            <ThemedText>View in browser</ThemedText>
          </Pressable>
        ) : null}
      </View>

      {downloadError ? (
        <View style={styles.errorCard}>
          <ThemedText style={styles.errorText}>{downloadError}</ThemedText>
        </View>
      ) : null}

      {hasCompleted && downloadItem?.localUri ? (
        <View
          style={[
            styles.infoCard,
            {
              borderColor: palette.tabIconDefault,
              backgroundColor: colorScheme === 'dark' ? '#1F1F23' : '#fff',
            },
          ]}>
          <ThemedText type="defaultSemiBold">Saved file</ThemedText>
          <ThemedText style={styles.metaText}>{downloadItem.localUri}</ThemedText>
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
  caption: {
    fontSize: 12,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonLabel: {
    color: '#fff',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  metaText: {
    fontSize: 12,
  },
  errorCard: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5484D',
    padding: 12,
    backgroundColor: '#FFE5E6',
  },
  errorText: {
    color: '#B3261E',
    fontSize: 12,
  },
  noteCard: {
    marginTop: 'auto',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7DBDF',
    padding: 16,
    backgroundColor: '#F5F6F8',
  },
});
