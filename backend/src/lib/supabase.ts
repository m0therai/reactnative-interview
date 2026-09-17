/**
 * Stand-in for `@supabase/supabase-js`.
 *
 * In production these functions use the real Supabase client against Postgres.
 * This exercise ships an in-memory copy with the same call style so it runs
 * with nothing installed:
 *
 *   const { data, error } = await client.from('notes').select('*').eq('id', id).single();
 *
 * Row Level Security (RLS) is modelled too. A user client only ever sees rows
 * where `user_id` matches the signed-in user. A service client bypasses RLS,
 * exactly like the service-role key does in Supabase.
 */

export type Row = Record<string, any>;
export type Result<T> = { data: T; error: null } | { data: null; error: { message: string; code: string } };

type Ctx = { userId: string | null; bypassRls: boolean };

const RLS_TABLES = new Set(['notes']);

const tables: Record<string, Row[]> = {
  notes: [],
  note_shares: [],
};

class QueryBuilder<T = Row> implements PromiseLike<Result<any>> {
  private filters: Array<(r: Row) => boolean> = [];
  private orderBy: { col: string; ascending: boolean } | null = null;
  private wantSingle = false;
  private op: { kind: 'select' } | { kind: 'insert'; rows: Row[] } | { kind: 'update'; patch: Row } | { kind: 'delete' } = { kind: 'select' };

  constructor(private table: string, private ctx: Ctx) {}

  select(_cols = '*') {
    if (this.op.kind === 'select') this.op = { kind: 'select' };
    return this;
  }
  insert(rows: Row | Row[]) {
    this.op = { kind: 'insert', rows: Array.isArray(rows) ? rows : [rows] };
    return this;
  }
  update(patch: Row) {
    this.op = { kind: 'update', patch };
    return this;
  }
  delete() {
    this.op = { kind: 'delete' };
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push((r) => r[col] === val);
    return this;
  }
  order(col: string, opts: { ascending?: boolean } = {}) {
    this.orderBy = { col, ascending: opts.ascending ?? true };
    return this;
  }
  single() {
    this.wantSingle = true;
    return this;
  }

  private visible(): Row[] {
    let rows = tables[this.table];
    if (!rows) throw new Error(`unknown table ${this.table}`);
    if (RLS_TABLES.has(this.table) && !this.ctx.bypassRls) {
      rows = rows.filter((r) => r.user_id === this.ctx.userId);
    }
    return rows;
  }

  private run(): Result<any> {
    const op = this.op;
    let rows: Row[];
    if (op.kind === 'insert') {
      if (RLS_TABLES.has(this.table) && !this.ctx.bypassRls) {
        const bad = op.rows.find((r) => r.user_id !== this.ctx.userId);
        if (bad) return { data: null, error: { message: 'new row violates row-level security policy', code: '42501' } };
      }
      const copies = op.rows.map((r) => ({ ...r }));
      tables[this.table].push(...copies);
      rows = copies;
    } else {
      rows = this.visible().filter((r) => this.filters.every((f) => f(r)));
      if (op.kind === 'update') {
        rows.forEach((r) => Object.assign(r, op.patch));
      } else if (op.kind === 'delete') {
        tables[this.table] = tables[this.table].filter((r) => !rows.includes(r));
      }
    }
    if (this.orderBy) {
      const { col, ascending } = this.orderBy;
      rows = [...rows].sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (ascending ? 1 : -1));
    }
    const out = rows.map((r) => ({ ...r }));
    if (this.wantSingle) {
      if (out.length !== 1) {
        return { data: null, error: { message: `expected a single row, got ${out.length}`, code: 'PGRST116' } };
      }
      return { data: out[0], error: null };
    }
    return { data: out, error: null };
  }

  then<R1 = Result<any>, R2 = never>(
    onfulfilled?: ((value: Result<any>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: any) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return Promise.resolve().then(() => this.run()).then(onfulfilled, onrejected);
  }
}

export interface SupabaseClient {
  from(table: string): QueryBuilder;
}

/** A client scoped to the signed-in user. RLS applies. Use this for anything a user asked for. */
export function createUserClient(userId: string): SupabaseClient {
  return { from: (table) => new QueryBuilder(table, { userId, bypassRls: false }) };
}

/**
 * A client with the service-role key. RLS does NOT apply: every row in every table is visible
 * and writable. Only for trusted server-side jobs (cron, webhooks) that have no user context.
 */
export function createServiceClient(): SupabaseClient {
  return { from: (table) => new QueryBuilder(table, { userId: null, bypassRls: true }) };
}

/** Test helper: wipe and reseed the in-memory tables. */
export function __reset(seed: Partial<Record<string, Row[]>> = {}) {
  for (const t of Object.keys(tables)) tables[t] = [];
  for (const [t, rows] of Object.entries(seed)) tables[t] = (rows ?? []).map((r) => ({ ...r }));
}

/** Test helper: read a table directly, bypassing everything. */
export function __table(name: string): Row[] {
  return tables[name].map((r) => ({ ...r }));
}
