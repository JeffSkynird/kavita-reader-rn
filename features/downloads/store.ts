import { create } from 'zustand';

import type { DownloadItem, EnqueueDownloadPayload, DownloadStatus } from './types';

function generateId(): string {
  const globalCrypto = globalThis.crypto as Crypto | undefined;

  if (globalCrypto?.randomUUID) {
    return globalCrypto.randomUUID();
  }

  return `dl_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function createDownloadItem(payload: EnqueueDownloadPayload): DownloadItem {
  const now = new Date().toISOString();

  return {
    id: generateId(),
    title: payload.title,
    sourceUrl: payload.sourceUrl,
    resolvedUrl: payload.resolvedUrl,
    mimeType: payload.mimeType,
    rel: payload.rel,
    status: 'idle',
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };
}

type DownloadsState = {
  items: Record<string, DownloadItem>;
  enqueue: (payload: EnqueueDownloadPayload) => DownloadItem;
  updateStatus: (id: string, status: DownloadStatus, patch?: Partial<DownloadItem>) => void;
  getItem: (id: string) => DownloadItem | undefined;
};

export const useDownloadsStore = create<DownloadsState>((set, get) => ({
  items: {},
  enqueue: (payload) => {
    const item = createDownloadItem(payload);

    set((state) => ({
      items: {
        ...state.items,
        [item.id]: item,
      },
    }));

    return item;
  },
  updateStatus: (id, status, patch) => {
    set((state) => {
      const existing = state.items[id];

      if (!existing) {
        return state;
      }

      const next: DownloadItem = {
        ...existing,
        status,
        updatedAt: new Date().toISOString(),
        ...patch,
      };

      return {
        items: {
          ...state.items,
          [id]: next,
        },
      };
    });
  },
  getItem: (id) => get().items[id],
}));
