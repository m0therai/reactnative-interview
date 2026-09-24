/**
 * Stand-in for react-native's `AppState` with the same call style:
 *
 *   const sub = AppState.addEventListener('change', (state) => { ... });
 *   sub.remove();
 *
 * The real module is native. This one is a Set, so tests can fire events.
 */
export type AppStateStatus = 'active' | 'background' | 'inactive';
type Handler = (state: AppStateStatus) => void;

const handlers = new Set<Handler>();

export const AppState = {
  currentState: 'active' as AppStateStatus,

  addEventListener(_type: 'change', handler: Handler) {
    handlers.add(handler);
    return {
      remove() {
        handlers.delete(handler);
      },
    };
  },

  /** Test helper: fire a state change at every listener. */
  __emit(state: AppStateStatus) {
    AppState.currentState = state;
    for (const h of Array.from(handlers)) h(state);
  },
  /** Test helper. */
  __listenerCount() {
    return handlers.size;
  },
  /** Test helper. */
  __reset() {
    handlers.clear();
    AppState.currentState = 'active';
  },
};
