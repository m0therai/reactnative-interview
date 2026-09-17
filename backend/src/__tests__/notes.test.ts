/**
 * Baseline behaviour of the notes functions. These pass on a fresh checkout and
 * document how the backend behaves. Nothing to fix here.
 */
import { handle } from '../index';
import { __table } from '../lib/supabase';
import { ALICE, BOB, note, request, seed } from './helpers';

beforeEach(() => {
  seed([
    note({ id: 'n1', user_id: ALICE, updated_at: '2026-09-01T09:00:00.000Z' }),
    note({ id: 'n2', user_id: ALICE, updated_at: '2026-09-02T09:00:00.000Z', version: 3 }),
    note({ id: 'n3', user_id: BOB }),
  ]);
});

describe('auth', () => {
  it('rejects requests without a token', async () => {
    const res = await handle(request('/list-notes'));
    expect(res.status).toBe(401);
  });
});

describe('list-notes', () => {
  it('returns only the signed-in user’s notes, most recently updated first', async () => {
    const res = await handle(request('/list-notes', { as: ALICE }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.map((n: any) => n.id)).toEqual(['n2', 'n1']);
  });
});

describe('get-note', () => {
  it('returns a note the user owns', async () => {
    const res = await handle(request('/get-note', { as: ALICE, query: { id: 'n1' } }));
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe('n1');
  });

  it('returns 404 for a note owned by someone else (RLS hides it)', async () => {
    const res = await handle(request('/get-note', { as: ALICE, query: { id: 'n3' } }));
    expect(res.status).toBe(404);
  });
});

describe('update-note', () => {
  it('applies an update when the version matches and bumps the version', async () => {
    const res = await handle(request('/update-note', { method: 'PATCH', as: ALICE, body: { id: 'n2', content: 'new', version: 3 } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.content).toBe('new');
    expect(body.version).toBe(4);
  });

  it('rejects an update with a stale version and returns the current row', async () => {
    const res = await handle(request('/update-note', { method: 'PATCH', as: ALICE, body: { id: 'n2', content: 'stale', version: 2 } }));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe('version_conflict');
    expect(body.current.version).toBe(3);
    expect(__table('notes').find((n) => n.id === 'n2')!.content).toBe('Content of n2');
  });

  it('accepts an update without a version (legacy clients)', async () => {
    const res = await handle(request('/update-note', { method: 'PATCH', as: ALICE, body: { id: 'n2', content: 'forced' } }));
    expect(res.status).toBe(200);
    expect((await res.json()).version).toBe(4);
  });

  it('cannot update someone else’s note', async () => {
    const res = await handle(request('/update-note', { method: 'PATCH', as: ALICE, body: { id: 'n3', content: 'hijack', version: 1 } }));
    expect(res.status).toBe(404);
    expect(__table('notes').find((n) => n.id === 'n3')!.content).toBe('Content of n3');
  });
});
