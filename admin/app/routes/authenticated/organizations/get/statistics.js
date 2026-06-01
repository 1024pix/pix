import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class Statistics extends Route {
  @service store;

  async model() {
    const organization = await this.modelFor('authenticated.organizations.get');

    return this.store.queryRecord('organization-statistic', { organizationId: organization.id });
  }
}
