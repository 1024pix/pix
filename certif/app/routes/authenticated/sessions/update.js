/* eslint-disable ember/no-controller-access-in-routes*/

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

  deactivate() {
    this.controller.model.rollbackAttributes();
  }
}
