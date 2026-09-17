import { useMemo, useState } from 'react';
import { createApi } from './api/client';
import { NoteEditor } from './components/NoteEditor';
import { NotesList } from './components/NotesList';
import type { Note } from './types';

/**
 * Root of the web app. There is no bundler in this exercise, so this file is
 * here to show how the pieces fit together; the tests exercise the components
 * directly.
 */
export function App({ baseUrl, token, userId }: { baseUrl: string; token: string; userId: string }) {
  const api = useMemo(() => createApi({ baseUrl, token }), [baseUrl, token]);
  const [open, setOpen] = useState<Note | null>(null);

  return (
    <main>
      <h1>Notes</h1>
      {open ? (
        <>
          <button type="button" onClick={() => setOpen(null)}>
            ← Back
          </button>
          <NoteEditor api={api} note={open} currentUserId={userId} />
        </>
      ) : (
        <NotesList api={api} onOpen={setOpen} />
      )}
    </main>
  );
}
