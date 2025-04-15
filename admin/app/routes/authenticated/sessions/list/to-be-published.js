import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedSessionsListToBePublishedRoute extends Route {
  @service store;

  queryParams = {
    version: { refreshModel: true },
  };

  model(_, transition) {
    if (transition.to.queryParams.version === '3') {
      return this.modelFor('authenticated.sessions.list').v3SessionsToBePublished;
    }
    return this.modelFor('authenticated.sessions.list').v2SessionsToBePublished;
  }

  @action
  refreshModel() {
    this.modelFor('authenticated.sessions.list').refreshModel();
  }
}
