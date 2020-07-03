import Service from '@ember/service';

export default class MarkStoreService extends Service {

  state = null;
  available = false;

  getState() {
    if (this.available) {
      this.available = false;
      const state = this.state;
      this.state = null;
      return state;
    }
    return false;
  }

  storeState(state) {
    this.state = state;
    this.available = true;
  }

  hasState() {
    return this.available;
  }
}
