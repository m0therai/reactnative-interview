export type Note = {
  id: string;
  title: string;
  content: string;
  /** Server-side version. Bumped on every successful update. */
  version: number;
  created_at: string;
  updated_at: string;
};
