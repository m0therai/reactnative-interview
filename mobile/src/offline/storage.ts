/**
 * Stand-in for `@react-native-async-storage/async-storage` with the same API.
 * In the real app this is the native module; here it is a Map so tests need
 * no native code.
 */
const store = new Map<string, string>();

export const AsyncStorage = {
  async getItem(key: string): Promise<string | null> {
    return store.has(key) ? store.get(key)! : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    store.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    store.delete(key);
  },
  /** Test helper. */
  async clear(): Promise<void> {
    store.clear();
  },
};
