import Route from '@ember/routing/route';

export default class SessionsDetailsRoute extends Route {
  model(params) {
    return this.store.findRecord('session', params.session_id);
  }
}
