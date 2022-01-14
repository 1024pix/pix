import Route from '@ember/routing/route';

export default class SessionSupervisingRoute extends Route {
  model(params) {
    return this.store.queryRecord('session-for-supervising', { sessionId: params.session_id });
  }
}
