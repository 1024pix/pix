import { notEmpty } from '@ember/object/computed';
import Controller from '@ember/controller';
import config from '../../../config/environment';

export default Controller.extend({
  hasSession: notEmpty('model'),
  isSessionFinalizationActive: config.APP.isSessionFinalizationActive,

  actions: {
    goToDetails(sessionId) {
      this.transitionToRoute('authenticated.sessions.details', sessionId);
    },
  },
});
