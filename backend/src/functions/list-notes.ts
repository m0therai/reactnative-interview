import { createUserClient } from '../lib/supabase';
import { getUser, json, unauthorized } from '../lib/auth';

// GET /list-notes
export async function handler(req: Request): Promise<Response> {
  const user = getUser(req);
  if (!user) return unauthorized();

  const supabase = createUserClient(user.id);
  const { data, error } = await supabase.from('notes').select('*').order('updated_at', { ascending: false });
  if (error) return json({ error: error.message }, 500);
  return json(data);
}
