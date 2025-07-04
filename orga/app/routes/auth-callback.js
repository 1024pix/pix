import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CallbackRoute extends Route {
  @service session;

  queryParams = {
    code: {
      refreshModel: true,
    },
    state: {
      refreshModel: true,
    },
    error: {
      refreshModel: true,
    },
  };

  async model(params) {
    const { code, state, error } = params;

    if (error) return { error };
    await this.session.authenticate('authenticator:oauth2-code', code, state);

    return {};
  }
}
