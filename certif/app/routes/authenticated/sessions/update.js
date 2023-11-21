import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SessionsUpdateRoute extends Route {
  @service currentUser;
  @service store;
  @service dayjs;

  beforeModel() {
    this.currentUser.checkRestrictedAccess();
  }

  async model({ session_id }) {
    const session = await this.store.findRecord('session', session_id);
    this.dayjs.extend('customParseFormat');
    session.time = this.dayjs.self(session.time, 'HH:mm:ss').format('HH:mm');
    return session;
  }

  afterModel(model) {
    this.currentUser.updateCurrentCertificationCenter(model.certificationCenterId);
  }

  deactivate() {
    if (!this.isDestroying) {
      this.controller.model.rollbackAttributes();
    }
  }
}
