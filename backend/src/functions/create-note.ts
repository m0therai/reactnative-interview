import { getUser, json, unauthorized } from '../lib/auth';

/**
 * POST /create-note
 * Body: { title: string, content: string }
 *
 * Creates a note for the signed-in user and returns it with status 201.
 * A note with no title and no content is rejected with 400.
 */
export async function handler(req: Request): Promise<Response> {
  const user = getUser(req);
  if (!user) return unauthorized();

  // TODO: implement (Exercise 2). See update-note.ts for the shape of a handler
  // and lib/supabase.ts for the database client.
  return json({ error: 'Not implemented' }, 501);
}
