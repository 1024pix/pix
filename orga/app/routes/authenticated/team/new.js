import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class NewRoute extends Route {
  @service store;
  @service currentUser;

  beforeModel() {
    super.beforeModel(...arguments);
    if (!this.currentUser.isAdminInOrganization) {
      return this.replaceWith('application');
    }
  }

  model() {
    const organization = this.currentUser.organization;
    return this.store.createRecord('organizationInvitation', { organizationId: organization.id });
  }
}
