import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedSessionsListRoute extends Route {
  @service store;

  async model() {
    const v3Sessions = await this.store.query('with-required-action-session', {
      filter: {
        version: 3,
      },
    });

    const v2Sessions = await this.store.query('with-required-action-session', {
      filter: {
        version: 2,
      },
    });

    return { v2Sessions, v3Sessions };
  }
}
