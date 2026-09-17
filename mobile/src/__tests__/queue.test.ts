/**
 * Baseline behaviour of the offline queue. Passes on a fresh checkout.
 */
import { AsyncStorage } from '../offline/storage';
import { clearQueue, enqueue, getQueue, removeFromQueue, type QueuedEdit } from '../offline/queue';

const enqueueP = (edit: Parameters<typeof enqueue>[0]) =>
  new Promise<QueuedEdit>((res, rej) => enqueue(edit, (e, v) => (e ? rej(e) : res(v!))));
const getQueueP = () => new Promise<QueuedEdit[]>((res, rej) => getQueue((e, v) => (e ? rej(e) : res(v!))));
const removeP = (ids: string[]) => new Promise<void>((res, rej) => removeFromQueue(ids, (e) => (e ? rej(e) : res())));
const clearP = () => new Promise<void>((res, rej) => clearQueue((e) => (e ? rej(e) : res())));

beforeEach(() => AsyncStorage.clear());

describe('offline queue', () => {
  it('starts empty', async () => {
    expect(await getQueueP()).toEqual([]);
  });

  it('stores an edit with its base version', async () => {
    await enqueueP({ noteId: 'n1', title: 'T', content: 'C', baseVersion: 4 });
    const q = await getQueueP();
    expect(q).toHaveLength(1);
    expect(q[0]).toMatchObject({ noteId: 'n1', title: 'T', content: 'C', baseVersion: 4 });
    expect(q[0].queueId).toMatch(/^q_/);
  });

  it('replaces an older edit of the same note but keeps the original base version', async () => {
    await enqueueP({ noteId: 'n1', title: 'T1', content: 'C1', baseVersion: 4 });
    await enqueueP({ noteId: 'n1', title: 'T2', content: 'C2', baseVersion: 4 });
    const q = await getQueueP();
    expect(q).toHaveLength(1);
    expect(q[0]).toMatchObject({ title: 'T2', content: 'C2', baseVersion: 4 });
  });

  it('removes edits by queue id', async () => {
    const a = await enqueueP({ noteId: 'n1', title: 'T', content: 'C', baseVersion: 1 });
    await enqueueP({ noteId: 'n2', title: 'T', content: 'C', baseVersion: 1 });
    await removeP([a.queueId]);
    expect((await getQueueP()).map((q) => q.noteId)).toEqual(['n2']);
  });

  it('clears everything', async () => {
    await enqueueP({ noteId: 'n1', title: 'T', content: 'C', baseVersion: 1 });
    await clearP();
    expect(await getQueueP()).toEqual([]);
  });
});
