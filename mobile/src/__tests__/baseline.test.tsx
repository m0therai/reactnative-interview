/**
 * Baseline behaviour of the mobile app. Passes on a fresh checkout and should still
 * pass when you are done. Nothing to fix here.
 */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { App } from '../App';
import { NoteEditorScreen } from '../screens/NoteEditorScreen';
import { NotesListScreen } from '../screens/NotesListScreen';
import { fakeApi, note } from './helpers';

describe('NotesListScreen', () => {
  it('renders the notes returned by the API', async () => {
    const api = fakeApi([note({ id: 'n1', title: 'Shopping' }), note({ id: 'n2', title: 'Ideas' })]);
    render(<NotesListScreen api={api} onOpen={jest.fn()} />);

    expect(await screen.findByText('Shopping')).toBeTruthy();
    expect(screen.getByText('Ideas')).toBeTruthy();
    expect(screen.getByText('2 notes')).toBeTruthy();
  });

  it('opens a note when a row is pressed', async () => {
    const onOpen = jest.fn();
    render(<NotesListScreen api={fakeApi([note({ id: 'n1', title: 'Shopping' })])} onOpen={onOpen} />);

    fireEvent.press(await screen.findByTestId('note-n1'));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'n1' }));
  });
});

describe('NoteEditorScreen', () => {
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

describe('App', () => {
  it('opens a note from the list, saves it, and returns to the list', async () => {
    const api = fakeApi([note({ id: 'n1', title: 'Shopping', content: 'Eggs', version: 3 })]);
    render(<App api={api} />);

    fireEvent.press(await screen.findByTestId('note-n1'));
    expect(screen.getByTestId('editor-screen')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('content'), 'Eggs, milk');
    fireEvent.press(screen.getByTestId('save'));

    await waitFor(() => expect(api.updateNote).toHaveBeenCalledWith({ id: 'n1', title: 'Shopping', content: 'Eggs, milk', version: 3 }));
    await waitFor(() => expect(screen.queryByTestId('editor-screen')).toBeNull());
  });
});
