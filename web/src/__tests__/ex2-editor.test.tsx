/**
 * Exercise 2 (web): the note editor when the note changed on another device.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from '../components/NoteEditor';
import { fakeApi, note } from './helpers';

describe('NoteEditor', () => {
  it('saves the title and content with the version it last saw', async () => {
    const api = fakeApi([note({ id: 'n1', title: 'Shopping', content: 'Eggs', version: 3 })]);
    render(<NoteEditor api={api} note={note({ id: 'n1', title: 'Shopping', content: 'Eggs', version: 3 })} />);

    await userEvent.clear(screen.getByLabelText('Content'));
    await userEvent.type(screen.getByLabelText('Content'), 'Eggs, milk');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(api.updateNote).toHaveBeenCalledWith({ id: 'n1', title: 'Shopping', content: 'Eggs, milk', version: 3 });
    expect(await screen.findByRole('status')).toHaveTextContent('Saved');
  });

  it('keeps what the user typed when the note was changed elsewhere', async () => {
    // Server is already on version 4; the editor opened at version 3.
    const api = fakeApi([note({ id: 'n1', title: 'Shopping', content: 'Eggs and bread', version: 4 })]);
    render(<NoteEditor api={api} note={note({ id: 'n1', title: 'Shopping', content: 'Eggs', version: 3 })} />);

    await userEvent.clear(screen.getByLabelText('Content'));
    await userEvent.type(screen.getByLabelText('Content'), 'Eggs, milk');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toHaveValue('Eggs, milk');
  });
});
