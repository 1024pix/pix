import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class InvitationsRoute extends Route {
  @service store;
  @service router;

  beforeModel() {
    const organization = this.modelFor('authenticated.organizations.get');
    if (organization.isArchived) {
      return this.router.replaceWith('authenticated.organizations.get.target-profiles');
    }
  }

  async model() {
    this.store.unloadAll('organization-invitation');
    const organization = this.modelFor('authenticated.organizations.get');
    const organizationInvitations = await this.store.findAll('organization-invitation', {
      adapterOptions: { organizationId: organization.id },
    });

    return { organization, organizationInvitations };
  }
}
