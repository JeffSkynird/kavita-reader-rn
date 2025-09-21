import { useMutation } from '@tanstack/react-query';

import { useSession } from '@/providers/session-provider';

import type { OpdsEntry, OpdsLink } from '@/features/catalog/types';
import { downloadOpdsEntry } from '../services/download-service';
import type { DownloadItem } from '../types';

export function useDownloadOpdsEntry(entry: OpdsEntry, link?: OpdsLink | null) {
  const { session } = useSession();

  return useMutation<DownloadItem, Error>({
    mutationKey: ['download-opds-entry', entry.id, link?.href],
    mutationFn: async () => {
      if (!session) {
        throw new Error('There is no active session to download.');
      }

      if (!link?.href) {
        throw new Error('No valid download link found.');
      }

      return downloadOpdsEntry({ session, entry, link });
    },
  });
}
