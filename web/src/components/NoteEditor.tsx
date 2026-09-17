import { FormEvent, useState } from 'react';
import type { ApiClient } from '../api/client';
import type { Note } from '../types';

type Props = {
  api: ApiClient;
  note: Note;
  onSaved?: (note: Note) => void;
};

export function NoteEditor({ api, note: initial, onSaved }: Props) {
  const [note, setNote] = useState(initial);
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const dirty = title !== note.title || content !== note.content;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      const { status, body } = await api.updateNote({ id: note.id, title, content, version: note.version });
      if (status === 200) {
        const saved = body as Note;
        setNote(saved);
        setMessage('Saved');
        onSaved?.(saved);
      } else if (status === 409 && 'current' in body && body.current) {
        // Someone else saved this note first. Reload it.
        setNote(body.current);
        setTitle(body.current.title);
        setContent(body.current.content);
        setMessage('This note was changed elsewhere and has been reloaded.');
      } else {
        setMessage('Save failed. Please try again.');
      }
    } catch {
      setMessage('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="editor" onSubmit={handleSubmit}>
      <input aria-label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea aria-label="Content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write something…" rows={12} />
      <div className="editor-footer">
        <span className="editor-meta">v{note.version}</span>
        <button type="submit" disabled={!dirty || saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
