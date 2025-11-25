export class SessionStorageEntry {
  constructor(key) {
    this.key = key;
  }

  set(value) {
    sessionStorage.setItem(this.key, JSON.stringify({ value }));
  }

  get() {
    const result = JSON.parse(sessionStorage.getItem(this.key)) || {};
    return result.value;
  }

  remove() {
    sessionStorage.removeItem(this.key);
  }
}
