/**
 * Exercise 1, bug 1: Title edits are lost.
 *
 * On a device: open a note, change the title, tap Save. The title is unchanged.
 * Changing the content works fine.
 *
 * Where: mobile/src/screens/NoteEditorScreen.tsx
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { NoteEditorScreen } from '../screens/NoteEditorScreen';
import { note } from './helpers';

describe('Bug 1: Title edits are lost', () => {
  it('saves the title the user typed', () => {
    const onSave = jest.fn();
    render(<NoteEditorScreen note={note({ id: 'n1', title: 'Shopping', content: 'Eggs' })} onSave={onSave} />);

    fireEvent.changeText(screen.getByTestId('title'), 'Groceries');
    fireEvent.press(screen.getByTestId('save'));

    expect(onSave).toHaveBeenCalledWith({ title: 'Groceries', content: 'Eggs' });
  });
});
