import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SessionsFinalizeRoute extends Route {
  @service notifications;

  async model({ session_id }) {
    const session = await this.store.findRecord('session', session_id, { reload: true });
    await session.certificationReports;
    const featureToggles = this.store.peekRecord('feature-toggle', 0);
    const isReportsCategorizationFeatureToggleEnabled = featureToggles.reportsCategorization;

    return { session, isReportsCategorizationFeatureToggleEnabled };
  }

  async afterModel(model, transition) {
    if (model.session.isFinalized) {
      this.notifications.error('Cette session a déjà été finalisée.');

      transition.abort();
    }
  }
}
