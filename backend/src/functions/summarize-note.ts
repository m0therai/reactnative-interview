import { createUserClient } from '../lib/supabase';
import { getUser, json, unauthorized } from '../lib/auth';
import { summarizeNote } from '../lib/llm';

// POST /summarize-note  Body: { id: string }
export async function handler(req: Request): Promise<Response> {
  const user = getUser(req);
  if (!user) return unauthorized();

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  if (!body.id) return json({ error: 'id is required' }, 400);

  const supabase = createUserClient(user.id);
  const { data: note, error } = await supabase.from('notes').select('*').eq('id', body.id).single();
  if (error || !note) return json({ error: 'Note not found' }, 404);

  try {
    const result = await summarizeNote(note);
    return json(result);
  } catch (err) {
    return json({ error: 'Summarization failed', detail: (err as Error).message }, 500);
  }
}
