/**
 * Exercise 1: the notes list.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { NotesListScreen } from '../screens/NotesListScreen';
import { fakeApi, note } from './helpers';

/**
 * On a device, a string or number rendered directly inside a <View> throws
 * "Text strings must be rendered within a <Text> component" and crashes the
 * screen. The test renderer does not throw, so this walks the tree instead.
 */
function bareStrings(node: any, insideText = false): string[] {
  if (node == null || typeof node === 'boolean') return [];
  if (typeof node === 'string' || typeof node === 'number') return insideText ? [] : [String(node)];
  if (Array.isArray(node)) return node.flatMap((n) => bareStrings(n, insideText));
  const isText = node.type === 'Text';
  return (node.children ?? []).flatMap((c: any) => bareStrings(c, insideText || isText));
}

describe('NotesListScreen', () => {
  it('renders the notes returned by the API', async () => {
    const api = fakeApi([note({ id: 'n1', title: 'Shopping' }), note({ id: 'n2', title: 'Ideas' })]);
    render(<NotesListScreen api={api} onOpen={jest.fn()} />);

    expect(await screen.findByText('Shopping')).toBeTruthy();
    expect(screen.getByText('Ideas')).toBeTruthy();
    expect(screen.getByText('2 notes')).toBeTruthy();
  });

  it('shows the empty state, and nothing else, when there are no notes', async () => {
    const api = fakeApi([]);
    render(<NotesListScreen api={api} onOpen={jest.fn()} />);

    expect(await screen.findByText('No notes yet')).toBeTruthy();
    await waitFor(() => expect(api.listNotes).toHaveBeenCalled());
    expect(bareStrings(screen.toJSON())).toEqual([]);
  });
});
