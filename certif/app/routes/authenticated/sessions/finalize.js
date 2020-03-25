import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import config from '../../../config/environment';

export default class SessionsFinalizeRoute extends Route {
  @service notifications;

  async model({ session_id }) {
    const session = await this.store.findRecord('session', session_id, { reload: true });
    await session.certificationReports;
    return session;
  }

  async afterModel(model, transition) {
    if (model.isFinalized) {
      const { autoClear, clearDuration } = config.notifications;
      this.notifications.error('Cette session a déjà été finalisée.', { autoClear, clearDuration });

      transition.abort();
    }
  }
}
