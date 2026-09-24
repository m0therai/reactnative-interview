import { useState } from 'react';
import type { ApiClient } from './api/client';
import { NoteEditor } from './components/NoteEditor';
import { NotesList } from './components/NotesList';
import type { Note } from './types';

/**
 * Root of the web app. There is no bundler in this exercise; the entry point would
 * build the client with `createApi` and render `<App api={api} />`. The tests pass
 * a fake client in.
 */
export function App({ api }: { api: ApiClient }) {
  const [open, setOpen] = useState<Note | null>(null);

  return (
    <main>
      <h1>Notes</h1>
      {open ? (
        <>
          <button type="button" onClick={() => setOpen(null)}>
            ← Back
          </button>
          <NoteEditor api={api} note={open} />
        </>
      ) : (
        <NotesList api={api} onOpen={setOpen} />
      )}
    </main>
  );
}
