import { createUserClient } from '../lib/supabase';
import { getUser, json, unauthorized } from '../lib/auth';
import type { Note } from '../lib/types';

/**
 * PATCH /update-note
 * Body: { id: string, title?: string, content?: string, version?: number }
 *
 * Optimistic concurrency: the client sends the `version` it last saw. If the note has
 * moved on since then, the update is rejected with 409 and the current row is returned
 * so the client can decide what to do.
 */
export async function handler(req: Request): Promise<Response> {
  const user = getUser(req);
  if (!user) return unauthorized();

  let body: Partial<Note>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  if (!body.id) return json({ error: 'id is required' }, 400);
  if (body.title === undefined && body.content === undefined) {
    return json({ error: 'Nothing to update' }, 400);
  }

  const supabase = createUserClient(user.id);
  const { data: note, error } = await supabase.from('notes').select('*').eq('id', body.id).single();
  if (error || !note) return json({ error: 'Note not found' }, 404);

  // TODO: make `version` required once the mobile app (>= 2.4) is the only client in the wild.
  // Older clients don't send it, so for now an update without a version is applied as-is.
  if (body.version !== undefined && body.version !== note.version) {
    return json({ error: 'version_conflict', current: note }, 409);
  }

  const patch: Partial<Note> = {
    version: note.version + 1,
    updated_at: new Date().toISOString(),
  };
  if (body.title !== undefined) patch.title = body.title;
  if (body.content !== undefined) patch.content = body.content;

  const { data: updated } = await supabase.from('notes').update(patch).eq('id', note.id).select().single();
  return json(updated);
}
