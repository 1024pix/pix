import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CallbackRoute extends Route {
  @service session;

  queryParams = {
    code: { refreshModel: true },
    state: { refreshModel: true },
    redirect_uri: { refreshModel: true },
    error: { refreshModel: true },
    error_description: { refreshModel: true },
  };

  async model(params) {
    const { code, state, redirect_uri, error, error_description } = params;

    if (error) return { error, error_description };

    await this.session.authenticate('authenticator:oauth2-code', code, state);

    if (this.session.isAuthenticated) {
      window.location.href = decodeURIComponent(redirect_uri) || '/';
    }

    return {};
  }
}
