import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

import config from '../../../config/environment';

export default Controller.extend({
  isLoading: false,
  notifications: service('notification-messages'),

  actions: {
    finalizeSession() {
      this.set('isLoading', true);
      return this.model.finalize()
        .then(() => {
          this.set('isLoading', false);
          this.transitionToRoute('authenticated.sessions.details', this.model.id);

          const autoClear = config.notifications.autoClear;
          const clearDuration = config.notifications.clearDuration;

          this.get('notifications').success(
            'Les informations de la session ont été transmises avec succès.',
            { autoClear, clearDuration },
          );
        });
    },
  },
});
