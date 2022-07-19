import Route from '@ember/routing/route';

export default class New extends Route {
  async model() {
    const organization = await this.modelFor('authenticated.organizations.get');

    return this.store.createRecord('organization-place', { organizationId: organization.id });
  }
}
