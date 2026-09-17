/**
 * Auth helpers.
 *
 * In production the Authorization header carries a Supabase JWT and `getUser` verifies it.
 * Here the "JWT" is an unsigned base64 payload so the exercise needs no secrets, but the
 * rule is the same: the user's identity comes from the token, never from the request body.
 */

export type User = { id: string };

export function getUser(req: Request): User | null {
  const header = req.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(Buffer.from(header.slice(7), 'base64url').toString('utf8'));
    return typeof payload.sub === 'string' ? { id: payload.sub } : null;
  } catch {
    return null;
  }
}

/** Mint a token for a user id. Used by tests and by the mobile/web dev clients. */
export function makeToken(userId: string): string {
  return Buffer.from(JSON.stringify({ sub: userId }), 'utf8').toString('base64url');
}

export function unauthorized(): Response {
  return json({ error: 'Unauthorized' }, 401);
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
