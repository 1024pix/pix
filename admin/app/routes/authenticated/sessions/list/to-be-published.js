import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class AuthenticatedSessionsListToBePublishedRoute extends Route {
  @service store;

  queryParams = {
    version: { refreshModel: true },
  };

  model(_, transition) {
    if (transition.to.queryParams.version === '3') {
      return this.store.query('to-be-published-session', {
        filter: {
          version: 3,
        },
      });
    }
    return this.store.query('to-be-published-session', {
      filter: {
        version: 2,
      },
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
