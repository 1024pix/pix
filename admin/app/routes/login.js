import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LoginRoute extends Route {
  @service session;
  @service oidcIdentityProviders;

  beforeModel() {
    this.session.prohibitAuthentication('authenticated');
  }

  async model() {
    await this.oidcIdentityProviders.loadReadyIdentityProviders();
  }
}
