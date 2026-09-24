import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ApiClient } from './api/client';
import { NoteEditorScreen, type NoteDraft } from './screens/NoteEditorScreen';
import { NotesListScreen } from './screens/NotesListScreen';
import type { Note } from './types';

/**
 * Root of the mobile app. There is no navigator in this exercise, so this stands in
 * for a stack: the list is always mounted, and the editor sits on top of it while a
 * note is open, exactly as it would under react-navigation.
 */
export function App({ api }: { api: ApiClient }) {
  const [open, setOpen] = useState<Note | null>(null);

  async function save(draft: NoteDraft) {
    if (!open) return;
    await api.updateNote({ id: open.id, ...draft, version: open.version });
    setOpen(null);
  }

  return (
    <View style={styles.root}>
      <NotesListScreen api={api} onOpen={setOpen} />

      {open && (
        <View style={styles.editor} testID="editor-screen">
          <Pressable testID="back" accessibilityRole="button" style={styles.back} onPress={() => setOpen(null)}>
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
          <NoteEditorScreen note={open} onSave={save} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  editor: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff' },
  back: { padding: 12 },
  backText: { color: '#1b3cf5', fontSize: 16 },
});
