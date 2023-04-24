import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SessionsFinalizeRoute extends Route {
  @service notifications;
  @service currentUser;
  @service store;
  @service router;
  @service intl;

  beforeModel() {
    this.currentUser.checkRestrictedAccess();
  }

  async model({ session_id }) {
    try {
      const session = await this.store.findRecord('session', session_id, { reload: true });
      await session.certificationReports;

      return session;
    } catch (responseError) {
      this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
      this.router.transitionTo('authenticated.sessions.details', session_id);
    }
  }

  async afterModel(model, transition) {
    if (model.isFinalized) {
      this.notifications.error('Cette session a déjà été finalisée.');

      transition.abort();
    }
    this.currentUser.updateCurrentCertificationCenter(model.certificationCenterId);
  }
}
