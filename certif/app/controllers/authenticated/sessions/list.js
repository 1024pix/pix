import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  hasSession: computed.notEmpty('model'),

  actions: {
    goToDetails(sessionId) {
      this.transitionToRoute('authenticated.sessions.details', sessionId);
    },
  },
});
