import Route from '@ember/routing/route';

export default class AuthenticatedSessionsWithRequiredActionListRoute extends Route {
  queryParams = {
    version: { refreshModel: true },
  };

  model(_, transition) {
    if (transition.to.queryParams.version === '3') {
      return this.modelFor('authenticated.sessions.list').v3SessionsWithRequiredAction;
    }
    return this.modelFor('authenticated.sessions.list').v2SessionsWithRequiredAction;
  }
}
