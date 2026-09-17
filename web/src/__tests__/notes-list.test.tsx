/**
 * Baseline behaviour of the notes list. Passes on a fresh checkout.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotesList } from '../components/NotesList';
import { fakeApi, note } from './helpers';

describe('NotesList', () => {
  it('renders notes from the API', async () => {
    render(<NotesList api={fakeApi([note({ id: 'n1', title: 'Shopping' })])} onOpen={jest.fn()} />);
    expect(await screen.findByText('Shopping')).toBeInTheDocument();
  });

  it('shows an empty state', async () => {
    render(<NotesList api={fakeApi([])} onOpen={jest.fn()} />);
    expect(await screen.findByText('No notes yet')).toBeInTheDocument();
  });

  it('opens a note on click', async () => {
    const onOpen = jest.fn();
    render(<NotesList api={fakeApi([note({ id: 'n1', title: 'Shopping' })])} onOpen={onOpen} />);
    await userEvent.click(await screen.findByText('Shopping'));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'n1' }));
  });
});
