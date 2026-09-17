/**
 * Exercise 1: the note editor.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { NoteEditorScreen } from '../screens/NoteEditorScreen';
import { note } from './helpers';

describe('NoteEditorScreen', () => {
  it('saves the title the user typed', () => {
    const onSave = jest.fn();
    render(<NoteEditorScreen note={note({ id: 'n1', title: 'Shopping', content: 'Eggs' })} onSave={onSave} />);

    fireEvent.changeText(screen.getByTestId('title'), 'Groceries');
    fireEvent.press(screen.getByTestId('save'));

    expect(onSave).toHaveBeenCalledWith({ title: 'Groceries', content: 'Eggs' });
  });

  it('saves the content the user typed', () => {
    const onSave = jest.fn();
    render(<NoteEditorScreen note={note({ id: 'n1', title: 'Shopping', content: 'Eggs' })} onSave={onSave} />);

    fireEvent.changeText(screen.getByTestId('content'), 'Eggs, milk');
    fireEvent.press(screen.getByTestId('save'));

    expect(onSave).toHaveBeenCalledWith({ title: 'Shopping', content: 'Eggs, milk' });
  });

  it('disables Save until something changed', () => {
    const onSave = jest.fn();
    render(<NoteEditorScreen note={note({ id: 'n1', title: 'Shopping', content: 'Eggs' })} onSave={onSave} />);

    fireEvent.press(screen.getByTestId('save'));
    expect(onSave).not.toHaveBeenCalled();
  });
});
