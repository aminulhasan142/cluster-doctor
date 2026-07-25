import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A single retry with a short, capped backoff. Every list/detail query
      // already has its own ErrorState + manual Retry button, and most also
      // poll on an interval — a long automatic retry chain (the default
      // exponential backoff) just makes a genuinely down backend look like
      // a frozen page for 10+ seconds before anything is shown.
      retry: 1,
      retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 3000),

      refetchOnWindowFocus: false,

      refetchOnReconnect: true,

      staleTime: 1000 * 60,

      gcTime: 1000 * 60 * 5,
    },

    mutations: {
      // Mutations hit non-idempotent endpoints (create/delete/trigger-migration/
      // login). Auto-retrying on failure risks duplicate side effects and, for
      // auth, leaves the user staring at a spinner through a pointless retry
      // of the same bad credentials — so mutations never retry by default.
      retry: 0,
    },
  },
});

export default queryClient;