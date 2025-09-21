import { useQuery } from '@tanstack/react-query';

import { useSession } from '@/providers/session-provider';

import { OpdsClient } from '../opds-client';
import type { OpdsRootFeed } from '../types';

export function useOpdsRoot() {
  const { session } = useSession();

  return useQuery<OpdsRootFeed, Error>({
    queryKey: ['opds-root', session?.apiKey],
    enabled: Boolean(session?.apiKey && session?.baseUrl),
    queryFn: async () => {
      if (!session) {
        throw new Error('Sesion no disponible');
      }

      return OpdsClient.fetchRoot(session);
    },
    staleTime: 1000 * 60,
  });
}
