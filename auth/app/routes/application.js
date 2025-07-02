import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service authentication;
  queryParams = {
    redirect_uri: {
      refreshModel: true,
    }
  }
  async beforeModel() {
    await this.authentication.setup();
  }

  async model (params) {
    return {
      redirect_uri: params.redirect_uri
    }
  }
}
