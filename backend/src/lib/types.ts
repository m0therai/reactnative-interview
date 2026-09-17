export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  /** Incremented on every successful update. Clients send the version they last saw. */
  version: number;
  created_at: string;
  updated_at: string;
};
