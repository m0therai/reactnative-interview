import { useEffect, useState } from 'react';
import type { ApiClient } from '../api/client';
import type { Note } from '../types';

type Props = {
  api: ApiClient;
  onOpen: (note: Note) => void;
};

export function NotesList({ api, onOpen }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listNotes()
      .then((data) => {
        if (!cancelled) setNotes(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (notes.length === 0) return <p>No notes yet</p>;

  return (
    <ul className="notes">
      {notes.map((n) => (
        <li key={n.id}>
          <button type="button" onClick={() => onOpen(n)}>
            <strong>{n.title}</strong>
            <span>{n.content}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
