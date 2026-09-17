import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Note } from '../types';

export type NoteDraft = { title: string; content: string };

type Props = {
  note: Note;
  onSave: (draft: NoteDraft) => void;
};

export function NoteEditorScreen({ note, onSave }: Props) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const dirty = title !== note.title || content !== note.content;

  return (
    <View style={styles.container}>
      <TextInput
        testID="title"
        style={styles.title}
        placeholder="Title"
        value={title}
        onChange={setTitle}
      />
      <TextInput
        testID="content"
        style={styles.content}
        placeholder="Write something…"
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />
      <Pressable
        testID="save"
        accessibilityRole="button"
        disabled={!dirty}
        style={[styles.button, !dirty && styles.buttonDisabled]}
        onPress={() => onSave({ title, content })}
      >
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', paddingVertical: 8 },
  content: { flex: 1, fontSize: 16, paddingVertical: 8 },
  button: { backgroundColor: '#1b3cf5', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
