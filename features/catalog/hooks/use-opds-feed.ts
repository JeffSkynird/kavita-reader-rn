import { useQuery } from '@tanstack/react-query';

import { useSession } from '@/providers/session-provider';

import { OpdsClient } from '../opds-client';
import type { OpdsRootFeed } from '../types';

export function useOpdsFeed(href?: string) {
  const { session } = useSession();

  return useQuery<OpdsRootFeed, Error>({
    queryKey: ['opds-feed', session?.apiKey, href],
    enabled: Boolean(session?.apiKey && session?.baseUrl && href),
    queryFn: async () => {
      if (!session || !href) {
        throw new Error('Insufficient parameters');
      }

      return OpdsClient.fetchByHref(session, href);
    },
    staleTime: 1000 * 60,
  });
}
