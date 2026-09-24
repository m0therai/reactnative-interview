/**
 * Exercise 2 (mobile): creating a note.
 *
 * On a device: tap "New note" on the list, type something, tap Save. You are back on
 * the list and the new note is the first row, straight away.
 *
 * The test presses a control with testID="new-note" on the list screen. The editor's
 * inputs and Save button keep their existing testIDs.
 */
import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react-native';
import { App } from '../App';
import { fakeApi, note } from './helpers';

describe('Exercise 2: New note', () => {
  it('creates a note and shows it at the top of the list', async () => {
    const api = fakeApi([note({ id: 'n1', title: 'Shopping', content: 'Eggs' })]);
    render(<App api={api} />);
    await screen.findByText('Shopping');

    fireEvent.press(screen.getByTestId('new-note'));
    fireEvent.changeText(screen.getByTestId('content'), 'Milk, eggs, bread');
    fireEvent.press(screen.getByTestId('save'));

    await waitFor(() => expect(api.createNote).toHaveBeenCalledWith({ title: '', content: 'Milk, eggs, bread' }));

    // Back on the list, and the new note is first.
    await waitFor(() => expect(screen.queryByTestId('editor-screen')).toBeNull());
    const rows = await screen.findAllByTestId(/^note-/);
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText('Milk, eggs, bread')).toBeTruthy();
  });
});
