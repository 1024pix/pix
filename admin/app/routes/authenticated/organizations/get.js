import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class GetRoute extends Route {
  @service oidcIdentityProviders;
  @service store;

  async beforeModel() {
    await this.oidcIdentityProviders.loadAllAvailableIdentityProviders();
  }

  model(params) {
    return this.store.findRecord('organization', params.organization_id, { reload: true });
  }
}
