import Route from '@ember/routing/route';
import moment from 'moment';

export default class SessionsUpdateRoute extends Route {

  async model({ session_id }) {
    const session = await this.store.findRecord('session', session_id);
    session.time = moment(session.time, 'HH:mm:ss').format('HH:mm');
    return session;
  }

  deactivate() {
    this.controller.model.rollbackAttributes();
  }
}
