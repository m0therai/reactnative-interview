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

export function fakeApi(notes: Note[] = []): jest.Mocked<ApiClient> {
  return {
    listNotes: jest.fn(async () => notes.map((n) => ({ ...n }))),
    getNote: jest.fn(async (id: string) => {
      const n = notes.find((x) => x.id === id);
      if (!n) throw new Error('get-note failed: 404');
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
