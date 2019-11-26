import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import config from '../../../config/environment';

export default Route.extend({
  notifications: service('notification-messages'),

  model({ session_id }) {
    return this.store.findRecord('session', session_id, { reload: true });
  },

  async afterModel(model, transition) {
    if (model.isFinalized) {
      const { autoClear, clearDuration } = config.notifications;
      this.get('notifications')
        .error('Cette session a déjà été finalisée.', { autoClear, clearDuration });

      transition.abort();
    }
  },
});
