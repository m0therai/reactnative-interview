import { makeToken } from '../lib/auth';
import { __reset } from '../lib/supabase';
import type { Note } from '../lib/types';

export const ALICE = 'user_alice';
export const BOB = 'user_bob';

export function note(overrides: Partial<Note> & { id: string; user_id: string }): Note {
  return {
    title: `Note ${overrides.id}`,
    content: `Content of ${overrides.id}`,
    version: 1,
    created_at: '2026-09-01T09:00:00.000Z',
    updated_at: '2026-09-01T09:00:00.000Z',
    ...overrides,
  };
}

export function seed(notes: Note[]) {
  __reset({ notes });
}

export function request(path: string, opts: { method?: string; as?: string | null; body?: unknown; query?: Record<string, string> } = {}) {
  const url = new URL(`http://functions.local${path}`);
  for (const [k, v] of Object.entries(opts.query ?? {})) url.searchParams.set(k, v);
  const headers: Record<string, string> = {};
  if (opts.as) headers.authorization = `Bearer ${makeToken(opts.as)}`;
  if (opts.body !== undefined) headers['content-type'] = 'application/json';
  return new Request(url, {
    method: opts.method ?? (opts.body !== undefined ? 'POST' : 'GET'),
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
}
