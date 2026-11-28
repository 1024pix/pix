import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CreditsLot extends Route {
  @service('store') store;
  @service router;

  async model() {
    const organization = await this.modelFor('authenticated.organizations.get');

    const creditsLot = await this.store.query('credits-lot', { organizationId: organization.id });
    return {
      organization,
      creditsLot,
    };
  }

  afterModel({ organization }) {
    if (!organization.isCreditsManagementEnabled) {
      this.router.replaceWith('authenticated.organizations.get.team');
    }
  }
}
