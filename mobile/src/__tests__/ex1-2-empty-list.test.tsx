/**
 * Exercise 1, bug 2: The app crashes when there are no notes.
 *
 * On a device: sign in with an account that has no notes. Red screen:
 * "Text strings must be rendered within a <Text> component".
 *
 * Where: mobile/src/screens/NotesListScreen.tsx
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { NotesListScreen } from '../screens/NotesListScreen';
import { fakeApi } from './helpers';

/**
 * The test renderer does not crash on a bare string or number inside a <View>; a
 * phone does. So this walks the rendered tree and collects any string or number
 * that is not inside a <Text>. The list should produce none.
 */
function bareStrings(node: any, insideText = false): string[] {
  if (node == null || typeof node === 'boolean') return [];
  if (typeof node === 'string' || typeof node === 'number') return insideText ? [] : [String(node)];
  if (Array.isArray(node)) return node.flatMap((n) => bareStrings(n, insideText));
  const isText = node.type === 'Text';
  return (node.children ?? []).flatMap((c: any) => bareStrings(c, insideText || isText));
}

describe('Bug 2: The app crashes when there are no notes', () => {
  it('shows the empty state, and nothing else, when there are no notes', async () => {
    const api = fakeApi([]);
    render(<NotesListScreen api={api} onOpen={jest.fn()} />);

    expect(await screen.findByText('No notes yet')).toBeTruthy();
    await waitFor(() => expect(api.listNotes).toHaveBeenCalled());
    expect(bareStrings(screen.toJSON())).toEqual([]);
  });
});
