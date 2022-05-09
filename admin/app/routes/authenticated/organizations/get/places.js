import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class Places extends Route {
  @service store;

  async model() {
    const organization = this.modelFor('authenticated.organizations.get');
    const places = await this.store.query('organization-place', {
      organizationId: organization.id,
    });

    return { organization, places };
  }
}
