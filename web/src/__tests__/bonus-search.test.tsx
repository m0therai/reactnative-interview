/**
 * Bonus (web): search on the server.
 *
 * The list gets a search box (labelled "Search"). It sends the query to the server
 * (`api.listNotes(query)`) once the user stops typing, rather than filtering locally
 * or sending a request per keystroke.
 */
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotesList } from '../components/NotesList';
import { fakeApi, note } from './helpers';

describe('Bonus: search on the server', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('sends the query to the server once the user stops typing', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    const api = fakeApi([
      note({ id: 'n1', title: 'Shopping', content: 'milk, eggs' }),
      note({ id: 'n2', title: 'Ideas', content: 'app for dog walkers' }),
    ]);
    render(<NotesList api={api} onOpen={jest.fn()} />);
    await screen.findByText('Shopping');
    const callsBeforeTyping = api.listNotes.mock.calls.length;

    await user.type(screen.getByLabelText('Search'), 'milk');
    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });

    await waitFor(() => expect(screen.queryByText('Ideas')).not.toBeInTheDocument());
    expect(screen.getByText('Shopping')).toBeInTheDocument();

    const searchCalls = api.listNotes.mock.calls.slice(callsBeforeTyping);
    expect(searchCalls).toHaveLength(1); // not one per keystroke
    expect(searchCalls[0][0]).toBe('milk'); // the server did the filtering
  });
});
