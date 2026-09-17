import { handle } from '../index';
import { __reset, __table } from '../lib/supabase';
import { ALICE, BOB, note, request } from './helpers';

beforeEach(() => {
  __reset({
    notes: [note({ id: 'n1', user_id: ALICE, title: 'Shopping', content: 'Eggs' }), note({ id: 'n3', user_id: BOB })],
    note_shares: [
      {
        token: 'expired1',
        note_id: 'n1',
        created_by: ALICE,
        created_at: '2026-08-01T09:00:00.000Z',
        expires_at: '2026-08-08T09:00:00.000Z',
      },
    ],
  });
});

describe('share-note', () => {
  it('requires auth', async () => {
    const res = await handle(request('/share-note', { body: { note_id: 'n1', user_id: ALICE } }));
    expect(res.status).toBe(401);
  });

  it('creates a share link for the user’s note', async () => {
    const res = await handle(request('/share-note', { as: ALICE, body: { note_id: 'n1', user_id: ALICE } }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.url).toMatch(/\/s\/[a-z0-9]+$/);
    expect(new Date(body.expires_at).getTime()).toBeGreaterThan(Date.now());
    expect(__table('note_shares').some((s) => s.note_id === 'n1' && s.created_by === ALICE)).toBe(true);
  });

  it('returns 404 for a note that does not exist', async () => {
    const res = await handle(request('/share-note', { as: ALICE, body: { note_id: 'nope', user_id: ALICE } }));
    expect(res.status).toBe(404);
  });
});

describe('get-shared-note', () => {
  it('returns the note for a valid link without auth', async () => {
    const created = await handle(request('/share-note', { as: ALICE, body: { note_id: 'n1', user_id: ALICE } }));
    const token = (await created.json()).url.split('/s/')[1];

    const res = await handle(request('/get-shared-note', { query: { token } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('Shopping');
    expect(body.content).toBe('Eggs');
  });

  it('rejects an expired link', async () => {
    const res = await handle(request('/get-shared-note', { query: { token: 'expired1' } }));
    expect(res.status).toBe(410);
  });

  it('returns 404 for an unknown token', async () => {
    const res = await handle(request('/get-shared-note', { query: { token: 'nope' } }));
    expect(res.status).toBe(404);
  });
});
