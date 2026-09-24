/**
 * Exercise 1, bug 3: Notes refresh twice after reopening the list.
 *
 * On a device: open the list, go back, open it again. Now switch to another app and
 * back. The list reloads twice. Do it again and it reloads three times. The closed
 * screens are still listening.
 *
 * Where: mobile/src/hooks/useAppForeground.ts
 */
import { act, renderHook } from '@testing-library/react-native';
import { useAppForeground } from '../hooks/useAppForeground';
import { AppState } from '../native/AppState';

beforeEach(() => AppState.__reset());

const backgroundThenForeground = () =>
  act(() => {
    AppState.__emit('background');
    AppState.__emit('active');
  });

describe('Bug 3: Notes refresh twice after reopening the list', () => {
  it('runs the callback once per foreground, and not at all once the screen is gone', () => {
    const onForeground = jest.fn();

    const first = renderHook(() => useAppForeground(onForeground));
    backgroundThenForeground();
    expect(onForeground).toHaveBeenCalledTimes(1);

    first.unmount(); // user leaves the screen
    backgroundThenForeground();
    expect(onForeground).toHaveBeenCalledTimes(1); // nothing is listening any more

    renderHook(() => useAppForeground(onForeground)); // user comes back to it
    backgroundThenForeground();
    expect(onForeground).toHaveBeenCalledTimes(2); // once more, not twice more
  });
});
