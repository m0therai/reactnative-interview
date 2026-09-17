/**
 * Exercise 1: the notes hook.
 */
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useNotes } from '../hooks/useNotes';
import { fakeApi, note } from './helpers';

const NOTES = [
  note({ id: 'n1', title: 'Shopping', content: 'milk, eggs' }),
  note({ id: 'n2', title: 'Ideas', content: 'app for dog walkers' }),
];

describe('useNotes', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads notes on mount', async () => {
    const { result } = renderHook(() => useNotes(fakeApi(NOTES)));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notes.map((n) => n.id)).toEqual(['n1', 'n2']);
  });

  it('filters notes by the search query', async () => {
    const { result } = renderHook(() => useNotes(fakeApi(NOTES)));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setQuery('milk'));
    await waitFor(() => expect(result.current.notes.map((n) => n.id)).toEqual(['n1']));
  });

  it('keeps the search query applied when the background refresh runs', async () => {
    const api = fakeApi(NOTES);
    const { result } = renderHook(() => useNotes(api));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setQuery('milk'));
    await waitFor(() => expect(result.current.notes.map((n) => n.id)).toEqual(['n1']));

    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });
    await waitFor(() => expect(api.listNotes.mock.calls.length).toBeGreaterThanOrEqual(3));

    expect(result.current.notes.map((n) => n.id)).toEqual(['n1']);
  });
});
