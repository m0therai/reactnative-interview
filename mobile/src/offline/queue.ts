// Offline edit queue.
//
// When the device has no connection, edits made in the editor are pushed on to
// this queue instead of being sent. They are pushed to the server later by
// `sync.ts`.
//
// TODO(2024-03): this predates our move to async/await. Rewrite with
// async/await and a typed record instead of the callback style when we next
// touch it. Behaviour is covered by queue.test.ts.

import { AsyncStorage } from './storage';

var QUEUE_KEY = 'offline_edit_queue_v1';

export type QueuedEdit = {
  /** Unique per queued edit. */
  queueId: string;
  noteId: string;
  title: string;
  content: string;
  /** The note's `version` at the moment the user made the edit. */
  baseVersion: number;
  queuedAt: string;
};

export type Callback<T> = (err: Error | null, value?: T) => void;

function readQueue(cb: Callback<QueuedEdit[]>) {
  AsyncStorage.getItem(QUEUE_KEY).then(
    function (raw) {
      if (!raw) return cb(null, []);
      try {
        cb(null, JSON.parse(raw));
      } catch (e) {
        cb(e as Error);
      }
    },
    function (e) {
      cb(e);
    },
  );
}

function writeQueue(queue: QueuedEdit[], cb: Callback<void>) {
  AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue)).then(
    function () {
      cb(null);
    },
    function (e) {
      cb(e);
    },
  );
}

/** Append an edit. If the same note is already queued, the newer edit replaces it. */
export function enqueue(edit: Omit<QueuedEdit, 'queueId' | 'queuedAt'>, cb: Callback<QueuedEdit>) {
  readQueue(function (err, queue) {
    if (err) return cb(err);
    var next = (queue || []).filter(function (q) {
      return q.noteId !== edit.noteId;
    });
    var existing = (queue || []).find(function (q) {
      return q.noteId === edit.noteId;
    });
    var item: QueuedEdit = {
      queueId: 'q_' + Math.random().toString(36).slice(2, 10),
      noteId: edit.noteId,
      title: edit.title,
      content: edit.content,
      // Keep the version from the first queued edit: that is what the user last saw from the server.
      baseVersion: existing ? existing.baseVersion : edit.baseVersion,
      queuedAt: new Date().toISOString(),
    };
    next.push(item);
    writeQueue(next, function (err) {
      if (err) return cb(err);
      cb(null, item);
    });
  });
}

/** All queued edits, oldest first. */
export function getQueue(cb: Callback<QueuedEdit[]>) {
  readQueue(function (err, queue) {
    if (err) return cb(err);
    cb(
      null,
      (queue || []).slice().sort(function (a, b) {
        return a.queuedAt < b.queuedAt ? -1 : a.queuedAt > b.queuedAt ? 1 : 0;
      }),
    );
  });
}

/** Remove the given queue ids. Ids that are not present are ignored. */
export function removeFromQueue(queueIds: string[], cb: Callback<void>) {
  readQueue(function (err, queue) {
    if (err) return cb(err);
    writeQueue(
      (queue || []).filter(function (q) {
        return queueIds.indexOf(q.queueId) === -1;
      }),
      cb,
    );
  });
}

export function clearQueue(cb: Callback<void>) {
  writeQueue([], cb);
}
