import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { formatSessionTime } from 'pix-certif/helpers/format-session-time';

export default class SessionsUpdateRoute extends Route {
  @service currentUser;
  @service store;

  beforeModel() {
    this.currentUser.checkRestrictedAccess();
  }

  async model({ session_id }) {
    const session = await this.store.findRecord('session-enrolment', session_id);
    session.time = formatSessionTime([session.time]);
    return session;
  }

  afterModel(model) {
    this.currentUser.updateCurrentCertificationCenter(model.certificationCenterId);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.model.rollbackAttributes();
    }
  }
}
