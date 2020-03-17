import Service from '@ember/service';

export default class MarkStoreService extends Service {

  state = null;
  available = false;

  getState() {
    if (this.available) {
      this.set('available', false);
      return this.state;
    }
    return false;
  }

  storeState(state) {
    this.set('state', state);
    this.set('available', true);
  }

  hasState() {
    return this.available;
  }
}
