import Route from '@ember/routing/route';
import moment from 'moment';
import { inject as service } from '@ember/service';

export default class SessionsUpdateRoute extends Route {
  @service currentUser;

  beforeModel() {
    this.currentUser.checkRestrictedAccess();
  }

  async model({ session_id }) {
    const session = await this.store.findRecord('session', session_id);
    session.time = moment(session.time, 'HH:mm:ss').format('HH:mm');
    return session;
  }

  afterModel(model) {
    this.currentUser.updateCurrentCertificationCenter(model.certificationCenterId);
  }

  deactivate() {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    this.controller.model.rollbackAttributes();
  }
}
