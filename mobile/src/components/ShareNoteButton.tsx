import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, Text } from 'react-native';
import type { ApiClient } from '../api/client';

type Props = {
  api: ApiClient;
  noteId: string;
  userId: string;
};

export function ShareNoteButton({ api, noteId, userId }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePress() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { url } = await api.shareNote({ noteId, userId });
      await Share.share({ message: url, url });
    } catch (e) {
      setError('Could not create a share link');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Pressable testID="share" accessibilityRole="button" style={styles.button} onPress={handlePress} disabled={busy}>
        <Text style={styles.text}>{busy ? 'Sharing…' : 'Share'}</Text>
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}
    </>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: 8, padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#1b3cf5' },
  text: { color: '#1b3cf5', fontWeight: '600' },
  error: { marginTop: 4, color: '#b00020' },
});
