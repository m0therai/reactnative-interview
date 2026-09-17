import { useState } from 'react';
import type { ApiClient } from '../api/client';

type Props = {
  api: ApiClient;
  noteId: string;
  userId: string;
};

export function ShareNoteButton({ api, noteId, userId }: Props) {
  const [state, setState] = useState<'idle' | 'busy' | 'copied' | 'error'>('idle');

  async function handleClick() {
    if (state === 'busy') return;
    setState('busy');
    try {
      const { url } = await api.shareNote({ noteId, userId });
      await navigator.clipboard.writeText(url);
      setState('copied');
    } catch {
      setState('error');
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={state === 'busy'}>
      {state === 'copied' ? 'Link copied' : state === 'error' ? 'Could not share' : 'Share'}
    </button>
  );
}
