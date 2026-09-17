import { createUserClient } from '../lib/supabase';
import { getUser, json, unauthorized } from '../lib/auth';

// GET /get-note?id=<note id>
export async function handler(req: Request): Promise<Response> {
  const user = getUser(req);
  if (!user) return unauthorized();

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return json({ error: 'id is required' }, 400);

  const supabase = createUserClient(user.id);
  const { data, error } = await supabase.from('notes').select('*').eq('id', id).single();
  if (error) return json({ error: 'Note not found' }, 404);
  return json(data);
}
