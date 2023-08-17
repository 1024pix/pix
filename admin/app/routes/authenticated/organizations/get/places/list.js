import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class Places extends Route {
  @service store;

  async model() {
    const organization = await this.modelFor('authenticated.organizations.get');
    const places = await this.store.query('organization-place', {
      organizationId: organization.id,
    });
    const placesCapacity = await this.store.queryRecord('organization-places-capacity', {
      organizationId: organization.id,
    });

    return { organization, places, placesCapacity };
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
