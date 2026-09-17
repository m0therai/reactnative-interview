/**
 * Function router.
 *
 * In production each file under `functions/` is its own Supabase Edge Function and is
 * started with `Deno.serve(handler)`. This router exists so the tests (and you) can call
 * any function with a plain `Request` and get a plain `Response` back, with no CLI or
 * Docker involved.
 */
import { handler as listNotes } from './functions/list-notes';
import { handler as getNote } from './functions/get-note';
import { handler as updateNote } from './functions/update-note';
import { handler as summarizeNote } from './functions/summarize-note';

type Handler = (req: Request) => Promise<Response>;

export const routes: Record<string, Handler> = {
  '/list-notes': listNotes,
  '/get-note': getNote,
  '/update-note': updateNote,
  '/summarize-note': summarizeNote,
};

export async function handle(req: Request): Promise<Response> {
  const path = new URL(req.url).pathname;
  const fn = routes[path];
  if (!fn) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  return fn(req);
}
