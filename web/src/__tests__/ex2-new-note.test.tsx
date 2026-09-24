/**
 * Exercise 2 (web): creating a note.
 *
 * Click "New note" on the list, type a title and some text, click Save. You are back
 * on the list and the new note is first.
 *
 * The test clicks a button named "New note" and uses the editor's existing labels.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import { fakeApi, note } from './helpers';

describe('Exercise 2: New note', () => {
  it('creates a note and shows it at the top of the list', async () => {
    const api = fakeApi([note({ id: 'n1', title: 'Shopping', content: 'Eggs' })]);
    render(<App api={api} />);
    await screen.findByText('Shopping');

    await userEvent.click(screen.getByRole('button', { name: 'New note' }));
    await userEvent.type(screen.getByLabelText('Title'), 'Groceries');
    await userEvent.type(screen.getByLabelText('Content'), 'Milk, eggs, bread');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(api.createNote).toHaveBeenCalledWith({ title: 'Groceries', content: 'Milk, eggs, bread' }));

    // Back on the list, and the new note is first.
    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Groceries');
  });
});
