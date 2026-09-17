/**
 * Exercise 2: syncing queued offline edits.
 */
import { AsyncStorage } from '../offline/storage';
import { enqueue, getQueue, type QueuedEdit } from '../offline/queue';
import { syncQueuedEdits } from '../offline/sync';
import { fakeApi, note } from './helpers';

const enqueueP = (edit: Parameters<typeof enqueue>[0]) =>
  new Promise<QueuedEdit>((res, rej) => enqueue(edit, (e, v) => (e ? rej(e) : res(v!))));
const getQueueP = () => new Promise<QueuedEdit[]>((res, rej) => getQueue((e, v) => (e ? rej(e) : res(v!))));

beforeEach(() => AsyncStorage.clear());

describe('syncQueuedEdits', () => {
  it('does nothing when the queue is empty', async () => {
    const api = fakeApi([note({ id: 'n1' })]);
    const result = await syncQueuedEdits(api);
    expect(result).toEqual({ pushed: 0, failed: 0 });
    expect(api.updateNote).not.toHaveBeenCalled();
  });

  it('pushes each queued edit to the server', async () => {
    const api = fakeApi([note({ id: 'n1', version: 1 }), note({ id: 'n2', version: 1 })]);
    await enqueueP({ noteId: 'n1', title: 'Shopping', content: 'milk', baseVersion: 1 });
    await enqueueP({ noteId: 'n2', title: 'Ideas', content: 'dog walkers', baseVersion: 1 });

    const result = await syncQueuedEdits(api);

    expect(result.pushed).toBe(2);
    expect(api.updateNote).toHaveBeenCalledTimes(2);
    expect(api.updateNote).toHaveBeenCalledWith(expect.objectContaining({ id: 'n1', title: 'Shopping', content: 'milk' }));
    expect(api.updateNote).toHaveBeenCalledWith(expect.objectContaining({ id: 'n2', title: 'Ideas', content: 'dog walkers' }));
  });

  it('removes pushed edits from the queue', async () => {
    const api = fakeApi([note({ id: 'n1', version: 1 })]);
    await enqueueP({ noteId: 'n1', title: 'Shopping', content: 'milk', baseVersion: 1 });

    await syncQueuedEdits(api);

    expect(await getQueueP()).toEqual([]);
  });

  it('keeps an edit queued when the server is unreachable', async () => {
    const api = fakeApi([note({ id: 'n1', version: 1 })]);
    api.updateNote.mockRejectedValueOnce(new Error('Network request failed'));
    await enqueueP({ noteId: 'n1', title: 'Shopping', content: 'milk', baseVersion: 1 });

    const result = await syncQueuedEdits(api);

    expect(result.failed).toBe(1);
    expect(await getQueueP()).toHaveLength(1);
  });
});
