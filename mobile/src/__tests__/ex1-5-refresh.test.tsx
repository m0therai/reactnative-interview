/**
 * Exercise 1, bug 5: The search filter disappears after 30 seconds.
 *
 * On a device: search for something. Wait for the background refresh. The list
 * shows every note again, though the search box still has your text in it.
 *
 * Where: mobile/src/hooks/useNotes.ts
 */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useNotes } from '../hooks/useNotes';
import { fakeApi, note } from './helpers';

const NOTES = [
  note({ id: 'n1', title: 'Shopping', content: 'milk, eggs' }),
  note({ id: 'n2', title: 'Ideas', content: 'app for dog walkers' }),
];

describe('Bug 5: The search filter disappears after 30 seconds', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps the search query applied when the background refresh runs', async () => {
    const api = fakeApi(NOTES);
    const { result, rerender } = renderHook(() => useNotes(api));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setQuery('milk'));
    await act(async () => {
      jest.advanceTimersByTime(1_000);
    });
    await waitFor(() => expect(result.current.notes.map((n) => n.id)).toEqual(['n1']));
    const callsBeforeRefresh = api.listNotes.mock.calls.length;

    // 30 seconds pass. Something else re-renders the screen halfway through, as
    // happens all the time in a real app.
    await act(async () => {
      jest.advanceTimersByTime(15_000);
    });
    rerender({});
    await act(async () => {
      jest.advanceTimersByTime(15_000);
    });

    // The refresh ran...
    await waitFor(() => expect(api.listNotes.mock.calls.length).toBeGreaterThan(callsBeforeRefresh));
    // ...and the filter is still applied.
    expect(result.current.notes.map((n) => n.id)).toEqual(['n1']);
  });
});
