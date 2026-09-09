import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class InvitationsRoute extends Route {
  @service store;
  @service router;

  beforeModel() {
    const organization = this.modelFor('authenticated.organizations.get');
    if (organization.isArchived) {
      return this.router.replaceWith('authenticated.organizations.get.details');
    }
  }

  async model() {
    const organization = await this.modelFor('authenticated.organizations.get');
    return {
      organization,
      organizationInvitations: await organization.organizationInvitations,
    };
  }
}
