import { useEffect, useState } from 'react';
import type { ApiClient } from '../api/client';
import type { Note } from '../types';
import { useAppForeground } from './useAppForeground';

const REFRESH_MS = 30_000;

function matches(note: Note, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q);
}

/**
 * Loads the user's notes, filters them by a search query, and refreshes them in
 * the background: every 30 seconds, and whenever the app comes back to the
 * foreground.
 */
export function useNotes(api: ApiClient) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const all = await api.listNotes();
      setNotes(all.filter((n) => matches(n, query)));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [query]);

  useEffect(() => {
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  useAppForeground(load);

  return { notes, query, setQuery, loading, error, refresh: load };
}
