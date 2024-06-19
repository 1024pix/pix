import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class NewRoute extends Route {
  @service store;
  @service currentUser;
  @service router;

  beforeModel() {
    super.beforeModel(...arguments);
    if (!this.currentUser.isAdminInOrganization) {
      return this.router.replaceWith('application');
    }
  }

  model() {
    const organization = this.currentUser.organization;
    return this.store.createRecord('organization-invitation', { organizationId: organization.id });
  }
}
