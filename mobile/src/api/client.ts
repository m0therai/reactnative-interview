import type { Note } from '../types';

export type UpdateNoteInput = {
  id: string;
  title?: string;
  content?: string;
  version?: number;
};

export type ApiResponse<T> = { status: number; body: T };

export type ShareNoteInput = { noteId: string; userId: string };
export type ShareLink = { url: string; expires_at: string };

export type ApiClient = {
  listNotes(): Promise<Note[]>;
  getNote(id: string): Promise<Note>;
  updateNote(input: UpdateNoteInput): Promise<ApiResponse<Note | { error: string; current?: Note }>>;
  shareNote(input: ShareNoteInput): Promise<ShareLink>;
};

/**
 * Thin fetch wrapper around the backend functions. `baseUrl` is the functions host
 * and `token` is the user's session JWT. In tests this whole client is replaced
 * with a fake, so nothing here hits the network.
 */
export function createApi({ baseUrl, token }: { baseUrl: string; token: string }): ApiClient {
  const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };

  return {
    async listNotes() {
      const res = await fetch(`${baseUrl}/list-notes`, { headers });
      if (!res.ok) throw new Error(`list-notes failed: ${res.status}`);
      return res.json();
    },
    async getNote(id) {
      const res = await fetch(`${baseUrl}/get-note?id=${encodeURIComponent(id)}`, { headers });
      if (!res.ok) throw new Error(`get-note failed: ${res.status}`);
      return res.json();
    },
    async updateNote(input) {
      const res = await fetch(`${baseUrl}/update-note`, { method: 'PATCH', headers, body: JSON.stringify(input) });
      return { status: res.status, body: await res.json() };
    },
    async shareNote({ noteId, userId }) {
      const res = await fetch(`${baseUrl}/share-note`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ note_id: noteId, user_id: userId }),
      });
      if (!res.ok) throw new Error(`share-note failed: ${res.status}`);
      return res.json();
    },
  };
}
