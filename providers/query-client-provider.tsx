import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useMemo } from 'react';

const defaultQueryOptions = {
  retry: 1,
};

export function AppQueryClientProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: defaultQueryOptions,
        },
      }),
    [],
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
