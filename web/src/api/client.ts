import type { Note } from '../types';

export type CreateNoteInput = { title: string; content: string };

export type UpdateNoteInput = {
  id: string;
  title?: string;
  content?: string;
  version?: number;
};

export type ApiResponse<T> = { status: number; body: T };

export type ApiClient = {
  /** All of the user's notes, newest first. `query` is only used once search moves to the server (bonus). */
  listNotes(query?: string): Promise<Note[]>;
  getNote(id: string): Promise<Note>;
  createNote(input: CreateNoteInput): Promise<Note>;
  updateNote(input: UpdateNoteInput): Promise<ApiResponse<Note | { error: string; current?: Note }>>;
};

/**
 * Thin fetch wrapper around the backend functions. In tests this whole client
 * is replaced with a fake, so nothing here hits the network.
 */
export function createApi({ baseUrl, token }: { baseUrl: string; token: string }): ApiClient {
  const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };

  return {
    async listNotes(query) {
      const qs = query ? `?q=${encodeURIComponent(query)}` : '';
      const res = await fetch(`${baseUrl}/list-notes${qs}`, { headers });
      if (!res.ok) throw new Error(`list-notes failed: ${res.status}`);
      return res.json();
    },
    async getNote(id) {
      const res = await fetch(`${baseUrl}/get-note?id=${encodeURIComponent(id)}`, { headers });
      if (!res.ok) throw new Error(`get-note failed: ${res.status}`);
      return res.json();
    },
    async createNote(input) {
      const res = await fetch(`${baseUrl}/create-note`, { method: 'POST', headers, body: JSON.stringify(input) });
      if (!res.ok) throw new Error(`create-note failed: ${res.status}`);
      return res.json();
    },
    async updateNote(input) {
      const res = await fetch(`${baseUrl}/update-note`, { method: 'PATCH', headers, body: JSON.stringify(input) });
      return { status: res.status, body: await res.json() };
    },
  };
}
