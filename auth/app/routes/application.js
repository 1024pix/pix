import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service authentication;
  queryParams = {
    redirect_uri: {
      refreshModel: true,
    }
  }

  async model (params) {
    const redirectUri = params.redirect_uri || 'http://localhost:4200';

    await this.authentication.setup(redirectUri);
    return {
      redirect_uri: redirectUri
    }
  }
}
