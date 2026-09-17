import { createServiceClient } from '../lib/supabase';
import { getUser, json, unauthorized } from '../lib/auth';

const SHARE_TTL_MS = 7 * 24 * 60 * 60; // 7 days
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? 'https://notes.example.com';

export type NoteShare = {
  token: string;
  note_id: string;
  created_by: string;
  created_at: string;
  expires_at: string;
};

/**
 * POST /share-note
 * Body: { note_id: string, user_id: string }
 *
 * Creates a share link for one of the user's notes. The link works for anyone who has it,
 * signed in or not, until it expires.
 */
export async function handler(req: Request): Promise<Response> {
  const user = getUser(req);
  if (!user) return unauthorized();

  let body: { note_id?: string; user_id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  if (!body.note_id) return json({ error: 'note_id is required' }, 400);
  if (!body.user_id) return json({ error: 'user_id is required' }, 400);

  // Shares are read back by anonymous visitors in get-shared-note, so both functions use the
  // service client for consistency.
  const supabase = createServiceClient();
  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', body.note_id)
    .eq('user_id', body.user_id)
    .single();
  if (error || !note) return json({ error: 'Note not found' }, 404);

  const share: NoteShare = {
    token: Math.random().toString(36).slice(2, 10),
    note_id: note.id,
    created_by: body.user_id,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + SHARE_TTL_MS).toISOString(),
  };
  const { error: insertError } = await supabase.from('note_shares').insert(share);
  if (insertError) return json({ error: insertError.message }, 500);

  return json({ url: `${PUBLIC_BASE_URL}/s/${share.token}`, expires_at: share.expires_at }, 201);
}
