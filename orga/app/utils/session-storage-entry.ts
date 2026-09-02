export class SessionStorageEntry<T = unknown> {
  key: string;

  constructor(key: string) {
    this.key = key;
  }

  set(value: T): void {
    sessionStorage.setItem(this.key, JSON.stringify({ value }));
  }

  get(): T | undefined {
    const rawEntry = sessionStorage.getItem(this.key);
    const result = (rawEntry ? JSON.parse(rawEntry) : {}) as { value?: T } | null;
    return result?.value;
  }

  remove(): void {
    sessionStorage.removeItem(this.key);
  }
}
