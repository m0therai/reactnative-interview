/**
 * Bonus (mobile): search on the server.
 *
 * The hook sends the query to the server (`api.listNotes(query)`) instead of
 * filtering locally, and it waits for the user to stop typing before it does.
 */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useNotes } from '../hooks/useNotes';
import { fakeApi, note } from './helpers';

const NOTES = [
  note({ id: 'n1', title: 'Shopping', content: 'milk, eggs' }),
  note({ id: 'n2', title: 'Ideas', content: 'app for dog walkers' }),
];

describe('Bonus: search on the server', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('sends the query to the server once the user stops typing', async () => {
    const api = fakeApi(NOTES);
    const { result } = renderHook(() => useNotes(api));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const callsBeforeTyping = api.listNotes.mock.calls.length;

    act(() => result.current.setQuery('m'));
    act(() => result.current.setQuery('mi'));
    act(() => result.current.setQuery('mil'));
    act(() => result.current.setQuery('milk'));
    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });

    await waitFor(() => expect(result.current.notes.map((n) => n.id)).toEqual(['n1']));

    const searchCalls = api.listNotes.mock.calls.slice(callsBeforeTyping);
    expect(searchCalls).toHaveLength(1); // not one per keystroke
    expect(searchCalls[0][0]).toBe('milk'); // the server did the filtering
  });
});
