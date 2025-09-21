import * as FileSystem from 'expo-file-system/legacy';

import type { SessionState } from '@/features/auth/types';
import type { OpdsEntry, OpdsLink } from '@/features/catalog/types';
import { resolveOpdsHref } from '@/features/catalog/opds-client';

import { useDownloadsStore } from '../store';
import type { DownloadItem } from '../types';

const DOWNLOAD_DIR = `${FileSystem.documentDirectory ?? ''}downloads`;

async function ensureDownloadDir() {
  if (!DOWNLOAD_DIR) {
    throw new Error('The file system is not available on this platform.');
  }

  const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);

  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-z0-9_.-]+/gi, '_');
}

function guessExtension(mimeType?: string): string {
  if (!mimeType) {
    return 'bin';
  }

  if (mimeType.includes('epub')) {
    return 'epub';
  }

  if (mimeType.includes('pdf')) {
    return 'pdf';
  }

  if (mimeType.includes('cbz') || mimeType.includes('zip')) {
    return 'cbz';
  }

  if (mimeType.includes('jpeg')) {
    return 'jpg';
  }

  if (mimeType.includes('png')) {
    return 'png';
  }

  return mimeType.split('/').pop() ?? 'bin';
}

function pickFileName(entry: OpdsEntry, link: OpdsLink): string {
  const url = link.href;
  const parsedName = url.split('/').pop();

  if (parsedName) {
    const decoded = decodeURIComponent(parsedName);
    const sanitized = sanitizeFileName(decoded);

    if (sanitized) {
      return sanitized;
    }
  }

  const base = entry.title ? sanitizeFileName(entry.title) : 'kavita-download';
  const ext = guessExtension(link.type);

  return `${base}.${ext}`;
}

export async function downloadOpdsEntry({
  session,
  entry,
  link,
}: {
  session: SessionState;
  entry: OpdsEntry;
  link: OpdsLink;
}): Promise<DownloadItem> {
  const resolvedUrl = resolveOpdsHref(session.baseUrl, link.href);
  const store = useDownloadsStore.getState();
  const item = store.enqueue({
    title: entry.title,
    sourceUrl: link.href,
    resolvedUrl,
    mimeType: link.type,
    rel: link.rel,
  });

  try {
    await ensureDownloadDir();
    const fileName = pickFileName(entry, link);
    const destination = `${DOWNLOAD_DIR}/${fileName}`;

    const downloadResumable = FileSystem.createDownloadResumable(
      resolvedUrl,
      destination,
      {},
      (progress) => {
        if (!progress.totalBytesExpectedToWrite) {
          return;
        }

        const ratio = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
        useDownloadsStore.getState().updateStatus(item.id, 'downloading', {
          progress: Math.min(1, Math.max(0, ratio)),
        });
      },
    );

    useDownloadsStore.getState().updateStatus(item.id, 'downloading', { progress: 0 });

    const result = await downloadResumable.downloadAsync();

    if (!result?.uri) {
      throw new Error('Could not obtain the downloaded file path.');
    }

    useDownloadsStore.getState().updateStatus(item.id, 'completed', {
      progress: 1,
      localUri: result.uri,
    });

    return useDownloadsStore.getState().getItem(item.id) as DownloadItem;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error during download.';
    useDownloadsStore.getState().updateStatus(item.id, 'error', {
      errorMessage: message,
    });

    throw error;
  }
}
