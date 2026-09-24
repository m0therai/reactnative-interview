/**
 * Exercise 2 (backend): creating a note.
 *
 * POST /create-note with { title, content } creates a note for the signed-in user.
 */
import { handle } from '../index';
import { ALICE, note, request, seed } from './helpers';

beforeEach(() => {
  seed([
    note({ id: 'n1', user_id: ALICE, updated_at: '2026-09-01T09:00:00.000Z' }),
    note({ id: 'n2', user_id: ALICE, updated_at: '2026-09-02T09:00:00.000Z' }),
  ]);
});

describe('Exercise 2: create-note', () => {
  it('requires auth', async () => {
    const res = await handle(request('/create-note', { body: { title: 'Groceries', content: 'Milk' } }));
    expect(res.status).toBe(401);
  });

  it('creates a note for the signed-in user and returns it', async () => {
    const res = await handle(request('/create-note', { as: ALICE, body: { title: 'Groceries', content: 'Milk' } }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({ title: 'Groceries', content: 'Milk', user_id: ALICE, version: 1 });
    expect(typeof body.id).toBe('string');
    expect(body.id.length).toBeGreaterThan(0);
    expect(typeof body.created_at).toBe('string');
    expect(typeof body.updated_at).toBe('string');

    // It is now the first note in the user's list (the list is newest first).
    const list = await (await handle(request('/list-notes', { as: ALICE }))).json();
    expect(list[0].id).toBe(body.id);
  });

  it('rejects a note with no title and no content', async () => {
    const res = await handle(request('/create-note', { as: ALICE, body: { title: '', content: '' } }));
    expect(res.status).toBe(400);
    const list = await (await handle(request('/list-notes', { as: ALICE }))).json();
    expect(list).toHaveLength(2);
  });
});
