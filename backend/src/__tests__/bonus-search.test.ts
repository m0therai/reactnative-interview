/**
 * Bonus (backend): search on the server.
 *
 * GET /list-notes?q=<text> returns only the signed-in user's notes whose title or
 * content contains the text, case-insensitively. Without q it returns all of them.
 */
import { handle } from '../index';
import { ALICE, BOB, note, request, seed } from './helpers';

beforeEach(() => {
  seed([
    note({ id: 'n1', user_id: ALICE, title: 'Shopping', content: 'milk, eggs', updated_at: '2026-09-01T09:00:00.000Z' }),
    note({ id: 'n2', user_id: ALICE, title: 'Ideas', content: 'app for dog walkers', updated_at: '2026-09-02T09:00:00.000Z' }),
    note({ id: 'n3', user_id: BOB, title: 'Milk run', content: 'for bob' }),
  ]);
});

const ids = async (res: Response) => (await res.json()).map((n: any) => n.id);

describe('Bonus: list-notes?q=', () => {
  it('filters by title or content, ignoring case', async () => {
    expect(await ids(await handle(request('/list-notes', { as: ALICE, query: { q: 'MILK' } })))).toEqual(['n1']);
    expect(await ids(await handle(request('/list-notes', { as: ALICE, query: { q: 'dog' } })))).toEqual(['n2']);
    expect(await ids(await handle(request('/list-notes', { as: ALICE, query: { q: 'zzz' } })))).toEqual([]);
  });

  it('returns everything, newest first, when q is empty or missing', async () => {
    expect(await ids(await handle(request('/list-notes', { as: ALICE })))).toEqual(['n2', 'n1']);
    expect(await ids(await handle(request('/list-notes', { as: ALICE, query: { q: '' } })))).toEqual(['n2', 'n1']);
  });
});
