import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ApiClient } from '../api/client';
import { useNotes } from '../hooks/useNotes';
import type { Note } from '../types';

type Props = {
  api: ApiClient;
  onOpen: (note: Note) => void;
};

export function NotesListScreen({ api, onOpen }: Props) {
  const { notes, query, setQuery, loading, error } = useNotes(api);

  return (
    <View style={styles.container}>
      <TextInput
        testID="search"
        style={styles.search}
        placeholder="Search notes"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {notes.length && <Text style={styles.count}>{notes.length} notes</Text>}

      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={notes}
        keyExtractor={(n) => n.id}
        ListEmptyComponent={loading ? <Text style={styles.empty}>Loading…</Text> : <Text style={styles.empty}>No notes yet</Text>}
        renderItem={({ item }) => (
          <Pressable testID={`note-${item.id}`} style={styles.row} onPress={() => onOpen(item)}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.preview} numberOfLines={2}>
              {item.content}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  search: { margin: 12, padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  count: { marginHorizontal: 12, color: '#666', fontSize: 12 },
  error: { margin: 12, color: '#b00020' },
  empty: { margin: 12, color: '#666' },
  row: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#ddd' },
  title: { fontSize: 16, fontWeight: '600' },
  preview: { color: '#444', marginTop: 2 },
});
