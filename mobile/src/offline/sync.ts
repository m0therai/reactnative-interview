import type { ApiClient } from '../api/client';

export type SyncResult = {
  /** Edits that reached the server. */
  pushed: number;
  /** Edits that could not be pushed and are still queued. */
  failed: number;
};

/**
 * Push every queued offline edit to the server.
 *
 * Called by the app when connectivity comes back (see NetInfo listener in App.tsx
 * in the real app). Must be safe to call repeatedly.
 */
export async function syncQueuedEdits(api: ApiClient): Promise<SyncResult> {
  // TODO: implement (Exercise 2)
  throw new Error('not implemented');
}
