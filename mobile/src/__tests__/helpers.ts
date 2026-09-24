import type { ApiClient } from '../api/client';
import type { Note } from '../types';

export function note(overrides: Partial<Note> & { id: string }): Note {
  return {
    title: `Note ${overrides.id}`,
    content: `Content of ${overrides.id}`,
    version: 1,
    created_at: '2026-09-01T09:00:00.000Z',
    updated_at: '2026-09-01T09:00:00.000Z',
    ...overrides,
  };
}

/**
 * In-memory fake of the API client. Behaves like the backend: the list is newest
 * first, `q` filters on title or content, updates bump the version.
 */
export function fakeApi(notes: Note[] = []): jest.Mocked<ApiClient> {
  let created = 0;
  const matches = (n: Note, q: string) => {
    const s = q.trim().toLowerCase();
    return !s || n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s);
  };
  const newestFirst = (a: Note, b: Note) => (a.updated_at < b.updated_at ? 1 : a.updated_at > b.updated_at ? -1 : 0);

  return {
    listNotes: jest.fn(async (query?: string) =>
      notes
        .filter((n) => matches(n, query ?? ''))
        .sort(newestFirst)
        .map((n) => ({ ...n })),
    ),
    getNote: jest.fn(async (id: string) => {
      const n = notes.find((x) => x.id === id);
      if (!n) throw new Error('get-note failed: 404');
      return { ...n };
    }),
    createNote: jest.fn(async ({ title, content }) => {
      const now = new Date().toISOString();
      const n: Note = { id: `new_${++created}`, title, content, version: 1, created_at: now, updated_at: now };
      notes.push(n);
      return { ...n };
    }),
    updateNote: jest.fn(async (input) => {
      const n = notes.find((x) => x.id === input.id);
      if (!n) return { status: 404, body: { error: 'Note not found' } };
      if (input.version !== undefined && input.version !== n.version) {
        return { status: 409, body: { error: 'version_conflict', current: { ...n } } };
      }
      const updated = { ...n, ...input, version: n.version + 1, updated_at: new Date().toISOString() };
      Object.assign(n, updated);
      return { status: 200, body: updated };
    }),
  };
}
