import { notEmpty } from '@ember/object/computed';
import Controller from '@ember/controller';

export default Controller.extend({
  hasSession: notEmpty('model'),

  actions: {
    goToDetails(sessionId) {
      this.transitionToRoute('authenticated.sessions.details', sessionId);
    },
  },
});
