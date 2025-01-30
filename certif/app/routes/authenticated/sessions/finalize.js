import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SessionsFinalizeRoute extends Route {
  @service pixToast;
  @service currentUser;
  @service store;
  @service router;
  @service intl;

  beforeModel() {
    this.currentUser.checkRestrictedAccess();
  }

  async model({ session_id }) {
    try {
      const session = await this.store.findRecord('session-management', session_id, {
        reload: true,
      });
      await session.certificationReports;

      return session;
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('common.api-error-messages.internal-server-error') });
      this.router.transitionTo('authenticated.sessions.details', session_id);
    }
  }

  async afterModel(model, transition) {
    if (model.isFinalized) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('common.api-error-messages.SESSION_ALREADY_FINALIZED'),
      });

      transition.abort();
    }
  }
}
