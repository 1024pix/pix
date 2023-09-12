import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedRoute extends Route {
  @service session;
  @service oidcIdentityProviders;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async model() {
    await this.oidcIdentityProviders.loadAllAvailableIdentityProviders();
  }
}
