import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  tagName: '',
  isLoading: false,
  store: service(),

  actions: {
    finalizeSession(session) {
      this.set('isLoading', true);
      return session.finalize()
        .then(() => this.set('isLoading', false));
    }
  }
});
