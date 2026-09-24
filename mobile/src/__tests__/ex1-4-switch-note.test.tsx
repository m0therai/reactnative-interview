/**
 * Exercise 1, bug 4: Opening a second note shows the first one.
 *
 * On a device: open a note. While it is open, tap a notification for a different
 * note. The editor's title and content still show the first note.
 *
 * Where: mobile/src/screens/NoteEditorScreen.tsx
 */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NoteEditorScreen } from '../screens/NoteEditorScreen';
import { note } from './helpers';

describe('Bug 4: Opening a second note shows the first one', () => {
  it('shows the new note when a different note is opened in the same editor', () => {
    const shopping = note({ id: 'n1', title: 'Shopping', content: 'Eggs' });
    const ideas = note({ id: 'n2', title: 'Ideas', content: 'App for dog walkers' });

    const { rerender } = render(<NoteEditorScreen note={shopping} onSave={jest.fn()} />);
    expect(screen.getByTestId('title').props.value).toBe('Shopping');

    rerender(<NoteEditorScreen note={ideas} onSave={jest.fn()} />);
    expect(screen.getByTestId('title').props.value).toBe('Ideas');
    expect(screen.getByTestId('content').props.value).toBe('App for dog walkers');
  });
});
