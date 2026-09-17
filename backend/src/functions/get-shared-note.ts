import { createServiceClient } from '../lib/supabase';
import { json } from '../lib/auth';

/**
 * GET /get-shared-note?token=<share token>
 *
 * Public: no auth. Returns the shared note if the link is still valid.
 */
export async function handler(req: Request): Promise<Response> {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return json({ error: 'token is required' }, 400);

  const supabase = createServiceClient();
  const { data: share, error } = await supabase.from('note_shares').select('*').eq('token', token).single();
  if (error || !share) return json({ error: 'Link not found' }, 404);

  if (share.expires_at < new Date().toISOString()) {
    return json({ error: 'Link expired' }, 410);
  }

  const { data: note, error: noteError } = await supabase.from('notes').select('*').eq('id', share.note_id).single();
  if (noteError || !note) return json({ error: 'Link not found' }, 404);

  return json({
    title: note.title,
    content: note.content,
    updated_at: note.updated_at,
    owner: note.user_id,
    expires_at: share.expires_at,
  });
}
