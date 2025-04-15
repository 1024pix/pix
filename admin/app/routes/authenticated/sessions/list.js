import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedSessionsListRoute extends Route {
  @service store;

  async model() {
    const v3SessionsWithRequiredAction = await this.store.query('with-required-action-session', {
      filter: {
        version: 3,
      },
    });

    const v3SessionsToBePublished = await this.store.query('to-be-published-session', {
      filter: {
        version: 3,
      },
    });

    const v2SessionsWithRequiredAction = await this.store.query('with-required-action-session', {
      filter: {
        version: 2,
      },
    });

    const v2SessionsToBePublished = await this.store.query('to-be-published-session', {
      filter: {
        version: 2,
      },
    });

    const refreshModel = this.refreshModel;

    return {
      v3SessionsWithRequiredAction,
      v3SessionsToBePublished,
      v2SessionsWithRequiredAction,
      v2SessionsToBePublished,
      refreshModel,
    };
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
